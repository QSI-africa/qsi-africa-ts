const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware, isSuperUser } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { sendTaskAssignmentEmail, sendTaskRejectionEmail } = require("../services/emailService");
const fs = require("fs");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper to determine which statuses a role should see in the "pool"
const getStatusesForRole = (role) => {
  switch (role) {
    case "ARCHITECT":
      return ["PENDING_ARCHITECT_DESIGN"];
    case "ENGINEER":
      return ["PENDING_ENGINEER_DESIGN"];
    case "QUANTITY_SURVEYOR":
      return ["PENDING_QUANTIFYING"];
    default:
      return [];
  }
};

// GET /api/admin/tasks
router.get("/", async (req, res) => {
  try {
    let whereClause = {};

    // 1. Role-Based Filtering
    if (
      ["TEAM_MEMBER", "ENGINEER", "ARCHITECT", "QUANTITY_SURVEYOR"].includes(
        req.user.role
      )
    ) {
      // Show tasks explicitly assigned to me OR unassigned tasks in my role's queue
      const roleStatuses = getStatusesForRole(req.user.role);
      whereClause = {
        OR: [
          { assignedToId: req.user.id },
          {
            assignedToId: null,
            status: { in: roleStatuses },
          },
        ],
      };
    }
    // SUPER_USER sees all (empty whereClause)

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        // --- CRITICAL FIX: Deep include for Client Document ---
        submission: {
          include: {
            document: true,
          },
        },
        // -----------------------------------------------------
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        // Internal documents (Engineer uploads)
        taskDocuments: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// GET /api/admin/tasks/:taskId
router.get("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        submission: {
          include: {
            document: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedBy: {
          select: { name: true, email: true },
        },
        auditLogs: {
          // REMOVED: orderBy clause
          include: {
            actor: { select: { name: true } },
          },
        },
        documents: {
          // REMOVED: orderBy clause
          include: {
            user: {
              select: { name: true, role: true },
            },
          },
        },
        taskDocuments: {
          // REMOVED: orderBy clause
          include: {
            uploadedBy: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Security Check
    const allowedRoles = ["TEAM_MEMBER", "ENGINEER", "ARCHITECT", "QUANTITY_SURVEYOR"];
    if (allowedRoles.includes(req.user.role)) {
       const roleStatuses = getStatusesForRole(req.user.role);
       const isAssignedToMe = task.assignedToId === req.user.id;
       const isInMyPool = task.assignedToId === null && roleStatuses.includes(task.status);
       
       if (!isAssignedToMe && !isInMyPool) {
          return res.status(403).json({ error: "Forbidden: You do not have access to this task." });
       }
    }

    res.json(task);
  } catch (error) {
    console.error(`Failed to fetch task ${taskId}:`, error);
    res.status(500).json({ error: "Failed to fetch task details." });
  }
});

// PUT /api/admin/tasks/:taskId/assign
router.put("/:taskId/assign", isSuperUser, async (req, res) => {
  const { taskId } = req.params;
  const { role } = req.body; // Expecting 'role' instead of 'teamMemberId'

  if (!role) {
      return res.status(400).json({ error: "Target role is required." });
  }

  try {
    const currentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!currentTask) return res.status(404).json({ error: "Task not found." });

    const originalStatus = currentTask.status;
    let nextStatus;

    // =========================================
    // 🚀 MAIN STATUS TRANSITION ENGINE (ROLE BASED)
    // =========================================
    switch (currentTask.status) {
      case "PENDING_ASSIGNMENT":
        if (role === "ARCHITECT") {
          nextStatus = "PENDING_ARCHITECT_DESIGN";
        } else if (role === "ENGINEER") {
          nextStatus = "PENDING_ENGINEER_DESIGN";
        } else {
          return res.status(400).json({
            error: "Only ARCHITECT or ENGINEER roles can be assigned initially.",
          });
        }
        break;

      default:
        // For now, only supporting initial assignment via this flow.
        return res.status(400).json({
          error: `Cannot assign task in ${currentTask.status} state.`,
        });
    }

    // =========================================
    // 🚀 UPDATE TASK
    // =========================================
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: null, // Broadcast to pool
        assignedById: req.user.id,
        status: nextStatus,
      },
    });

    // =========================================
    // 🧾 AUDIT LOG
    // =========================================
    await prisma.auditLog.create({
      data: {
        action: "TASK_ASSIGNED_TO_ROLE",
        taskId: updatedTask.id,
        actorId: req.user.id,
        details: {
          from: originalStatus,
          to: nextStatus,
          assignedRole: role,
        },
      },
    });

    // Email notification skipped for role broadcast as per requirements.

    res.json(updatedTask);
  } catch (error) {
    console.error("Failed to assign task:", error);
    res.status(500).json({ error: "Failed to assign task." });
  }
});

// PUT /api/admin/tasks/:taskId/reassign
router.put("/:taskId/reassign", isSuperUser, async (req, res) => {
  const { taskId } = req.params; // Use consistent param name
  const { teamMemberId } = req.body;

  try {
    const currentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!currentTask) return res.status(404).json({ error: "Task not found." });

    if (!currentTask.assignedToId) {
      return res.status(400).json({
        error: "Task is not currently assigned, use the assign endpoint.",
      });
    }

    const newAssignedToUser = await prisma.user.findUnique({
      where: { id: teamMemberId },
    });
    if (!newAssignedToUser)
      return res.status(404).json({ error: "New assignee user not found." });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: teamMemberId,
        assignedById: req.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "TASK_REASSIGNED",
        details: { fromUser: currentTask.assignedToId, toUser: teamMemberId },
        taskId: updatedTask.id,
        actorId: req.user.id,
      },
    });

    sendTaskAssignmentEmail(updatedTask, newAssignedToUser, req.user).catch(
      console.error
    );

    res.json(updatedTask);
  } catch (error) {
    console.error("Failed to reassign task:", error); // Log error
    res.status(500).json({ error: "Failed to reassign task." });
  }
});

// POST /api/admin/tasks/:taskId/upload
router.post(
  "/:taskId/upload",
  upload.array("documents", 5), // Allow up to 5 files at once
  async (req, res) => {
    const { taskId } = req.params;
    const { documentType, comments } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    if (!documentType) {
      return res.status(400).json({ error: "documentType is required." });
    }

    try {
      // Check task existence and permissions
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        // Clean up uploaded files
        files.forEach((file) => {
          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting orphaned file:", err);
            });
          }
        });
        return res.status(404).json({ error: "Task not found." });
      }

      // Authorization check
      if (task.assignedToId !== req.user.id && req.user.role !== "SUPER_USER") {
        // Clean up uploaded files
        files.forEach((file) => {
          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting orphaned file:", err);
            });
          }
        });
        return res.status(403).json({
          error: "Forbidden: You are not assigned to this task.",
        });
      }

      // Create document records for each file
      const documentPromises = files.map((file) => {
        const fileUrl = `/uploads/${file.filename}`;
        return prisma.taskDocument.create({
          data: {
            filename: file.originalname,
            filepath: fileUrl,
            mimetype: file.mimetype,
            documentType: documentType,
            uploadedById: req.user.id,
            taskId: taskId,
            comments: comments || null,
          },
        });
      });

      const documents = await Promise.all(documentPromises);

      // Update task status based on document type and current status
      let nextStatus = task.status;

      if (documentType === "ARCHITECT_DESIGN") {
        // When an architect uploads, it stays in the Architect phase
        // until they click the manual "Hand over to Engineer" button on the frontend.
        nextStatus = "PENDING_ENGINEER_DESIGN";
      } else if (documentType === "ENGINEER_DESIGN") {
        // Only the Engineer's upload (or manual submit) moves it to Review.
        nextStatus = "PENDING_DESIGN_APPROVAL";
      } else if (
        documentType === "QUOTATION" &&
        task.status === "PENDING_QUANTIFYING"
      ) {
        nextStatus = "PENDING_FINAL_APPROVAL";
      } else if (documentType === "REVISION") {
        // If uploading revisions, move back to appropriate pending state
        if (task.status.includes("APPROVAL")) {
          const baseType = documentType.includes("ARCHITECT")
            ? "ARCHITECT"
            : "ENGINEER";
          nextStatus = `PENDING_${baseType}_DESIGN`;
        }
      }

      // Only update task if status has changed
      if (nextStatus !== task.status) {
        await prisma.task.update({
          where: { id: taskId },
          data: { status: nextStatus },
        });
      }

      // Create audit log for bulk upload
      await prisma.auditLog.create({
        data: {
          action: "DOCUMENTS_UPLOADED",
          details: {
            count: files.length,
            type: documentType,
            filenames: files.map((f) => f.originalname),
            comments: comments,
          },
          taskId: taskId,
          actorId: req.user.id,
        },
      });

      res.status(201).json({
        message: `Successfully uploaded ${files.length} file(s)`,
        documents: documents,
        taskStatus: nextStatus,
      });
    } catch (error) {
      console.error("File upload failed:", error);

      // Clean up uploaded files on error
      files.forEach((file) => {
        if (file.path) {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting orphaned file:", err);
          });
        }
      });

      res.status(500).json({ error: "File upload failed." });
    }
  }
);

// PUT /api/admin/tasks/:taskId/approve
router.put("/:taskId/approve", isSuperUser, async (req, res) => {
  const { taskId } = req.params; // Use consistent param name
  try {
    const currentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!currentTask) return res.status(404).json({ error: "Task not found." });

    let nextStatus;
    let action;
    let dataToUpdate = {};

    if (currentTask.status === "PENDING_DESIGN_APPROVAL") {
      nextStatus = "PENDING_QUANTIFYING";
      action = "DESIGN_APPROVED";
      // Find a QS user to auto-assign (or leave unassigned for manual assignment)
      // Example: find first available QS
      const quantitySurveyor = await prisma.user.findFirst({
        where: { role: "QUANTITY_SURVEYOR" },
      });
      dataToUpdate = {
        status: nextStatus,
        // Optionally auto-assign:
        // assignedToId: quantitySurveyor?.id,
        // assignedById: quantitySurveyor ? req.user.id : null,
      };
    } else if (currentTask.status === "PENDING_FINAL_APPROVAL") {
      nextStatus = "COMPLETED";
      action = "QUOTATION_APPROVED";
      dataToUpdate = {
        status: nextStatus,
        assignedToId: null,
        assignedById: null,
      };
    } else {
      return res
        .status(400)
        .json({ error: "Task is not in a state that can be approved." });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        action: action,
        details: { from: currentTask.status, to: nextStatus },
        taskId: taskId,
        actorId: req.user.id,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error("Failed to approve task:", error); // Log error
    res.status(500).json({ error: "Failed to approve task." });
  }
});

// PUT /api/admin/tasks/:taskId/reject
router.put("/:taskId/reject", isSuperUser, async (req, res) => {
  const { taskId } = req.params; // Use consistent param name
  const { reason } = req.body;

  if (!reason)
    return res
      .status(400)
      .json({ error: "A reason is required for rejection." });

  try {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignedTo: true }, // Include who it was assigned to
    });
    if (!currentTask) return res.status(404).json({ error: "Task not found." });

    let nextStatus;
    let action;
    let sendRejectionEmail = false;
    let rejectionRecipient = null;

    if (currentTask.status === "PENDING_DESIGN_APPROVAL") {
      nextStatus = "PENDING_DESIGN"; // Send back to Engineer/Architect
      action = "DESIGN_REJECTED";
      rejectionRecipient = currentTask.assignedTo; // Notify the person whose work was rejected
      sendRejectionEmail = true;
    } else if (currentTask.status === "PENDING_FINAL_APPROVAL") {
      nextStatus = "PENDING_QUANTIFYING"; // Send back to QS
      action = "QUOTATION_REJECTED";
      rejectionRecipient = currentTask.assignedTo; // Notify the person whose work was rejected
      sendRejectionEmail = true;
    } else {
      return res.status(400).json({
        error: `Task cannot be rejected in ${currentTask.status} state.`,
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: nextStatus }, // Keep assignee, just change status
    });

    await prisma.auditLog.create({
      data: {
        action: action,
        details: { from: currentTask.status, to: nextStatus, reason: reason },
        taskId: taskId,
        actorId: req.user.id,
      },
    });

    // Optional: Send email notification about rejection
    if (sendRejectionEmail && rejectionRecipient) {
      // Assuming sendTaskRejectionEmail is properly imported and implemented
      if (typeof sendTaskRejectionEmail === 'function') {
           sendTaskRejectionEmail(
            updatedTask,
            rejectionRecipient,
            req.user,
            reason
          ).catch(console.error);
      }
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Failed to reject task:", error); // Log error
    res.status(500).json({ error: "Failed to reject task." });
  }
});

module.exports = router;
