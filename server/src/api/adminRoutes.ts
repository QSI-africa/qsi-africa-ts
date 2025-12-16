// server/src/api/adminRoutes.js
import express, { Response, Router, NextFunction } from 'express';
import prisma from '../config/prisma';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { sendTaskAssignmentEmail } from '../services/emailService';
const router: Router = express.Router();
import bcrypt from 'bcrypt';
import { extractTextFromFile } from '../utils/textExtractor';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import * as pdfParseNs from 'pdf-parse';

const pdfParse = (pdfParseNs as any).default || pdfParseNs;

// Apply the auth middleware to ALL routes in this file
router.use(authMiddleware);

const SALT_ROUNDS = 10;

const isSuperUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== "SUPER_USER") {
    return res
      .status(403)
      .json({ error: "Forbidden: Requires Super User role." });
  }
  next();
};

const isSuperUserOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== "SUPER_USER" && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Forbidden: Requires Super User or Admin role." });
  }
  next();
};

router.get("/tasks", async (req: AuthRequest, res: Response) => {
  try {
    let whereClause: any = {};

    if (
      ["TEAM_MEMBER", "ENGINEER", "ARCHITECT", "QUANTITY_SURVEYOR"].includes(
        req.user.role
      )
    ) {
      whereClause = { assignedToId: req.user.id };
    }
    // SUPER_USER sees all (empty whereClause)

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        // --- CRITICAL FIX: Deep include for Client Document ---
        submission: {
          include: {
            documents: true,
          },
        },
        // -----------------------------------------------------
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        // Internal documents (Engineer uploads)
        documents: true,
        taskDocuments: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(tasks);
  } catch (error: any) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

router.get("/tasks/:taskId", async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        // Deep include for Client Document
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
          orderBy: { createdAt: "desc" },
          include: {
            // --- FIX: Changed 'user' to 'actor' based on your Prisma Schema ---
            actor: { select: { name: true } },
          },
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
          include: {
            uploadedBy: { select: { name: true, role: true } },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Security Check: Prevent team members from viewing unassigned tasks via ID
    if (
      ["TEAM_MEMBER", "ENGINEER", "ARCHITECT", "QUANTITY_SURVEYOR"].includes(
        req.user.role
      ) &&
      task.assignedToId !== req.user.id
    ) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not assigned to this task." });
    }

    res.json(task);
  } catch (error: any) {
    console.error(`Failed to fetch task ${taskId}:`, error);
    res.status(500).json({ error: "Failed to fetch task details." });
  }
});

// PUT /api/admin/tasks/:taskId/assign
router.put("/tasks/:taskId/assign", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { teamMemberId } = req.body;

  try {
    const currentTask = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });
    if (!currentTask)
      return res.status(404).json({ error: "Task not found." });

    const assignedToUser = await prisma.user.findUnique({
      where: { id: teamMemberId },
    });

    if (!assignedToUser)
      return res.status(404).json({ error: "Assignee user not found." });

    const originalStatus = currentTask.status;
    let nextStatus = null;

    // =========================================
    // 🚀 MAIN STATUS TRANSITION ENGINE
    // =========================================

    switch (currentTask.status) {
      /**
       * -----------------------------------------
       * 1️⃣ FIRST ASSIGNMENT FLOW
       * -----------------------------------------
       */
      case "PENDING_ASSIGNMENT":
        if (assignedToUser.role === "ENGINEER") {
          nextStatus = "PENDING_ENGINEER_DESIGN";
        } else if (assignedToUser.role === "ARCHITECT") {
          nextStatus = "PENDING_ARCHITECT_DESIGN";
        } else {
          return res.status(400).json({
            error: `Cannot assign a ${assignedToUser.role} at the PENDING_ASSIGNMENT stage.`,
          });
        }
        break;

      /**
       * -----------------------------------------
       * 2️⃣ AFTER ARCHITECT DESIGN → Assign ENGINEER
       * -----------------------------------------
       */
      case "PENDING_ARCHITECT_DESIGN":
        if (assignedToUser.role !== "ENGINEER") {
          return res.status(400).json({
            error: "Only ENGINEER can be assigned after architect design.",
          });
        }
        nextStatus = "PENDING_ENGINEER_DESIGN";
        break;

      /**
       * -----------------------------------------
       * 3️⃣ AFTER ENGINEER DESIGN → Assign QS  
       * -----------------------------------------
       */
      case "PENDING_ENGINEER_DESIGN":
        if (assignedToUser.role !== "QUANTITY_SURVEYOR" && assignedToUser.role !== "ENGINEER") {
          return res.status(400).json({
            error:
              "Only QUANTITY_SURVEYOR or ENGINEER can be assigned after engineer design.",
          });
        }
        nextStatus = "PENDING_QUANTIFYING";
        break;

      /**
       * -----------------------------------------
       * 4️⃣ QUANTIFYING → no flow change here
       * -----------------------------------------
       */
      case "PENDING_QUANTIFYING":
        if (assignedToUser.role !== "QUANTITY_SURVEYOR")
          return res.status(400).json({
            error: "Only QUANTITY_SURVEYOR can work on quantifying stage.",
          });

        nextStatus = "PENDING_QUANTIFYING";
        break;

      /**
       * -----------------------------------------
       * ❌ INVALID STATES
       * -----------------------------------------
       */
      default:
        return res.status(400).json({
          error: `Cannot assign task in ${currentTask.status} state.`,
        });
    }

    // =========================================
    // 🚀 UPDATE TASK
    // =========================================

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: {
        assignedToId: teamMemberId,
        assignedById: req.user.id,
        status: nextStatus,
      },
    });

    // =========================================
    // AUDIT LOG
    // =========================================
    await prisma.auditLog.create({
      data: {
        action: "TASK_ASSIGNED",
        taskId: updatedTask.id,
        actorId: req.user.id,
        details: {
          from: originalStatus,
          to: nextStatus,
          assignedTo: teamMemberId,
        },
      },
    });

    // =========================================
    // NOTIFY ASSIGNED USER
    // =========================================
    sendTaskAssignmentEmail(updatedTask, assignedToUser as any, req.user as any).catch(
      console.error
    );

    res.json(updatedTask);
  } catch (error: any) {
    console.error("Failed to assign task:", error);
    res.status(500).json({ error: "Failed to assign task." });
  }
});


// PUT /api/admin/tasks/:taskId/reassign
router.put("/tasks/:taskId/reassign", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params; // Use consistent param name
  const { teamMemberId } = req.body;

  try {
    const currentTask = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });
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
      where: { id: parseInt(taskId) },
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

    sendTaskAssignmentEmail(updatedTask, newAssignedToUser as any, req.user as any).catch(
      console.error
    );

    res.json(updatedTask);
  } catch (error: any) {
    console.error("Failed to reassign task:", error); // Log error
    res.status(500).json({ error: "Failed to reassign task." });
  }
});

// GET /api/admin/users
router.get("/users", isSuperUser, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [
            "TEAM_MEMBER",
            "SUPER_USER",
            "ENGINEER",
            "ARCHITECT",
            "QUANTITY_SURVEYOR",
          ],
        },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" }, // Optional: Order users alphabetically
    });
    res.json(users);
  } catch (error: any) {
    console.error("Failed to fetch users:", error); // Log error
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// POST /api/admin/tasks/:taskId/upload
router.post(
  "/tasks/:taskId/upload",
  upload.array("documents", 5), // Allow up to 5 files at once
  async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const { documentType, comments } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    if (!documentType) {
      return res
        .status(400)
        .json({ error: "documentType is required." });
    }

    try {
      // Check task existence and permissions
      const task = await prisma.task.findUnique({ 
        where: { id: parseInt(taskId) } 
      });
      
      if (!task) {
        // Clean up uploaded files
        files.forEach(file => {
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
        files.forEach(file => {
          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting orphaned file:", err);
            });
          }
        });
        return res.status(403).json({ 
          error: "Forbidden: You are not assigned to this task." 
        });
      }

      // Create document records for each file
      const documentPromises = files.map(file => {
        const fileUrl = `/uploads/${file.filename}`;
        return prisma.taskDocument.create({
          data: {
            filename: file.originalname,
            filepath: fileUrl,
            mimetype: file.mimetype,
            documentType: documentType,
            uploadedById: req.user.id,
            taskId: parseInt(taskId),
          },
        });
      });

      const documents = await Promise.all(documentPromises);

      // Update task status based on document type and current status
      let nextStatus = task.status;
      
      if (documentType === "ARCHITECT_DESIGN" || documentType === "ENGINEER_DESIGN") {
        nextStatus = "PENDING_DESIGN_APPROVAL";
      } else if (documentType === "QUOTATION" && task.status === "PENDING_QUANTIFYING") {
        nextStatus = "PENDING_FINAL_APPROVAL";
      } else if (documentType === "REVISION") {
        // If uploading revisions, move back to appropriate pending state
        if (task.status.includes("APPROVAL")) {
          const baseType = documentType.includes("ARCHITECT") ? "ARCHITECT" : "ENGINEER";
          nextStatus = `PENDING_${baseType}_DESIGN`;
        }
      }

      // Only update task if status has changed
      if (nextStatus !== task.status) {
        await prisma.task.update({
          where: { id: parseInt(taskId) },
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
            filenames: files.map(f => f.originalname),
            comments: comments,
          },
          taskId: parseInt(taskId),
          actorId: req.user.id,
        },
      });

      res.status(201).json({
        message: `Successfully uploaded ${files.length} file(s)`,
        documents: documents,
        taskStatus: nextStatus,
      });

    } catch (error: any) {
      console.error("File upload failed:", error);
      
      // Clean up uploaded files on error
      files.forEach(file => {
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
router.put("/tasks/:taskId/approve", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params; // Use consistent param name
  try {
    const currentTask = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });
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
      where: { id: parseInt(taskId) },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        action: action,
        details: { from: currentTask.status, to: nextStatus },
        taskId: parseInt(taskId),
        actorId: req.user.id,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    console.error("Failed to approve task:", error); // Log error
    res.status(500).json({ error: "Failed to approve task." });
  }
});

// PUT /api/admin/tasks/:taskId/reject
router.put("/tasks/:taskId/reject", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params; // Use consistent param name
  const { reason } = req.body;

  if (!reason)
    return res
      .status(400)
      .json({ error: "A reason is required for rejection." });

  try {
    const currentTask = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
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
      where: { id: parseInt(taskId) },
      data: { status: nextStatus }, // Keep assignee, just change status
    });

    await prisma.auditLog.create({
      data: {
        action: action,
        details: { from: currentTask.status, to: nextStatus, reason: reason },
        taskId: parseInt(taskId),
        actorId: req.user.id,
      },
    });

    // Optional: Send email notification about rejection
    if (sendRejectionEmail && rejectionRecipient) {
      // TODO: Implement sendTaskRejectionEmail function
      // sendTaskRejectionEmail(updatedTask, rejectionRecipient, req.user, reason).catch(console.error);
      console.log('Task rejected, email notification pending implementation');
    }

    res.json(updatedTask);
  } catch (error: any) {
    console.error("Failed to reject task:", error); // Log error
    res.status(500).json({ error: "Failed to reject task." });
  }
});

// --- NEW: Create User ---
router.post("/users", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { email, name, password, role } = req.body;
  if (!email || !name || !password || !role) {
    return res
      .status(400)
      .json({ error: "Email, name, password, and role are required." });
  }
  // Optional: Validate role is one of the allowed assignable roles
  const allowedRoles = [
    "TEAM_MEMBER",
    "ENGINEER",
    "ARCHITECT",
    "QUANTITY_SURVEYOR",
    "SUPER_USER",
    "ADMIN",
  ];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid user role specified." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }, // Don't return password
    });
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint violation
      return res.status(400).json({ error: "Email already exists." });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
});

// --- NEW: Update User (Name/Role) ---
router.put("/users/:userId", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { name, role } = req.body;
  let dataToUpdate: any = {};

  if (name) dataToUpdate.name = name;
  if (role) {
    // Optional: Validate role
    const allowedRoles = [
      "TEAM_MEMBER",
      "ENGINEER",
      "ARCHITECT",
      "QUANTITY_SURVEYOR",
      "SUPER_USER",
      "ADMIN",
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid user role specified." });
    }
    dataToUpdate.role = role;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return res
      .status(400)
      .json({ error: "No update data provided (name or role)." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "User not found." });
    }
    console.error(`Update user ${userId} error:`, error);
    res.status(500).json({ error: "Failed to update user." });
  }
});

// --- NEW: Super User Resets Another User's Password ---
router.put("/users/:userId/reset-password", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "New password is required." });
  }
  if (req.user.id === userId) {
    return res.status(400).json({
      error:
        "Super User cannot reset their own password here. Use the forgot password flow.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // Also clear any pending email reset tokens for this user
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    res.status(200).json({ message: "User password reset successfully." });
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "User not found." });
    }
    console.error(`Reset password for user ${userId} error:`, error);
    res.status(500).json({ error: "Failed to reset user password." });
  }
});

// --- NEW: Delete User ---
// Be careful with deletion - consider soft delete (setting an 'isActive' flag) instead.
// Also consider what happens to tasks assigned to/by the deleted user.
router.delete("/users/:userId", isSuperUser, async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (req.user.id === userId) {
    return res.status(400).json({ error: "Cannot delete your own account." });
  }

  try {
    // Simple deletion for now. Add constraints/cleanup logic as needed.
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(204).send(); // No content on successful delete
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "User not found." });
    }
    // Handle constraint errors if user is linked to tasks/logs
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Cannot delete user. They are linked to existing tasks or logs. Reassign tasks first.",
      });
    }
    console.error(`Delete user ${userId} error:`, error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

router.get("/healing-submissions", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.healingSubmission.findMany({
      orderBy: { createdAt: "desc" }, // Show newest first
    });
    res.json(submissions);
  } catch (error: any) {
    console.error("Failed to fetch healing submissions:", error);
    res.status(500).json({ error: "Failed to fetch healing submissions." });
  }
});

router.get("/vision-submissions", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  console.log(`User ${req.user.id} requesting /api/admin/vision-submissions`); // Check if this log appears
  try {
    const submissions = await prisma.visionSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`Found ${submissions.length} vision submissions.`); // Check the count here
    res.json(submissions);
  } catch (error: any) {
    console.error("Failed to fetch vision submissions:", error);
    res.status(500).json({ error: "Failed to fetch vision submissions." });
  }
});

router.get("/pilots", async (req: AuthRequest, res: Response) => {
  const { type } = req.query; // Get the 'type' from the query string (e.g., ?type=FRAMEWORK)
  try {
    // Start with the base filter for active pilots
    let whereClause: any = {};

    // If a valid type is provided (CONCEPT or FRAMEWORK), add it to the filter
    if (type === "CONCEPT" || type === "FRAMEWORK") {
      whereClause.type = type;
    }
    // If no type is provided, it will fetch all active pilots (both types)

    console.log(`Fetching pilots with filter:`, whereClause); // Server log

    const pilots = await prisma.pilotProject.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      select: {
        // Select all fields needed by the client list/detail pages
        id: true,
        key: true,
        title: true,
        subtext: true,
        shortDescription: true,
        expandedView: true, // Send full data for the detail page
        imageUrl: true,
        type: true,
        isActive: true,
      },
    });
    res.json(pilots);
  } catch (error: any) {
    console.error("Failed to fetch pilot projects list:", error);
    res.status(500).json({ error: "Failed to fetch pilot projects." });
  }
});

// POST /api/admin/pilots (Create a new pilot)
router.post(
  "/pilots",
  isSuperUserOrAdmin,
  upload.single("contentFile"),
  async (req: AuthRequest, res: Response) => {
    // Parse the body (multipart/form-data turns everything to strings, so we might need to parse booleans)
    const body = req.body;
    const { key, title, subtext, shortDescription, imageUrl } = body;
    const isActive = body.isActive === "true" || body.isActive === true;
    const type = body.type || "CONCEPT";

    let expandedView = body.expandedView || "";

    // 1. If a file was uploaded, extract text from it
    if (req.file) {
      try {
        const fileText = await extractTextFromFile(req.file);
        // If user provided text manually, append the file text, otherwise just use file text
        expandedView = expandedView
          ? `${expandedView}\n\n${fileText}`
          : fileText;

        // Optional: Delete the file after extraction if you don't want to store the source doc
        // import fs from 'fs'; fs.unlinkSync(req.file.path);
      } catch (error: any) {
        return res
          .status(400)
          .json({ error: "Failed to extract text from uploaded file." });
      }
    }

    if (!key || !title || !shortDescription) {
      return res
        .status(400)
        .json({ error: "Key, title, and short description are required." });
    }

    try {
      const newPilot = await prisma.pilotProject.create({
        data: {
          key,
          title,
          subtext,
          shortDescription,
          expandedView, // <-- This now contains the extracted text
          imageUrl,
          isActive,
          type,
        },
      });
      res.status(201).json(newPilot);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({ error: `Pilot project with key '${key}' already exists.` });
      }
      console.error("Admin: Failed to create pilot:", error);
      res.status(500).json({ error: "Failed to create pilot project." });
    }
  }
);

// PUT /api/admin/pilots/:pilotId (Update an existing pilot)
// --- REPLACE THE PUT /pilots/:pilotId ROUTE ---
router.put(
  "/pilots/:pilotId",
  isSuperUserOrAdmin,
  upload.single("contentFile"),
  async (req: AuthRequest, res: Response) => {
    const { pilotId } = req.params;
    const body = req.body;

    // Construct update data
    const dataToUpdate: any = {};
    if (body.title) dataToUpdate.title = body.title;
    if (body.subtext) dataToUpdate.subtext = body.subtext;
    if (body.shortDescription)
      dataToUpdate.shortDescription = body.shortDescription;
    if (body.expandedView) dataToUpdate.expandedView = body.expandedView;
    if (body.imageUrl) dataToUpdate.imageUrl = body.imageUrl;
    if (body.isActive !== undefined)
      dataToUpdate.isActive =
        body.isActive === "true" || body.isActive === true;
    if (body.type) dataToUpdate.type = body.type;

    // 1. Handle File Upload for Update
    if (req.file) {
      try {
        const fileText = await extractTextFromFile(req.file);
        // Overwrite or append? Let's overwrite if file is provided, or append if they want.
        // For simplicity: If a file is uploaded, it REPLACES the expandedView content
        // unless they also typed something in the box.
        dataToUpdate.expandedView = fileText;
      } catch (error: any) {
        return res
          .status(400)
          .json({ error: "Failed to extract text from uploaded file." });
      }
    }

    try {
      const updatedPilot = await prisma.pilotProject.update({
        where: { id: pilotId },
        data: dataToUpdate,
      });
      res.json(updatedPilot);
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Pilot project not found." });
      }
      console.error(`Admin: Failed to update pilot ${pilotId}:`, error);
      res.status(500).json({ error: "Failed to update pilot project." });
    }
  }
);

// DELETE /api/admin/pilots/:pilotId (Delete a pilot)
router.delete("/pilots/:pilotId", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { pilotId } = req.params;
  try {
    await prisma.pilotProject.delete({
      where: { id: pilotId },
    });
    res.status(204).send(); // No content
  } catch (error: any) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Pilot project not found." });
    }
    console.error(`Admin: Failed to delete pilot ${pilotId}:`, error);
    res.status(500).json({ error: "Failed to delete pilot project." });
  }
});

// GET all Healing Packages
router.get("/healing-packages", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  console.log(`User ${req.user.id} requesting /api/admin/healing-packages`);
  try {
    const packages = await prisma.healingPackage.findMany({
      orderBy: { createdAt: "asc" },
    });
    console.log(`Found ${packages.length} healing packages.`);
    res.json(packages);
  } catch (error: any) {
    console.error("Failed to fetch healing packages:", error);
    res.status(500).json({ error: "Failed to fetch healing packages." });
  }
});

// POST a new Healing Package
router.post("/healing-packages", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { title, shortPreview, fee, duration, cta, isActive } = req.body;
  if (!title || !shortPreview || !fee || !duration || !cta) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const newPackage = await prisma.healingPackage.create({
      data: { title, shortPreview, fee, duration, cta, isActive },
    });
    res.status(201).json(newPackage);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: `A package with the title "${title}" already exists.` });
    }
    console.error("Failed to create healing package:", error);
    res.status(500).json({ error: "Failed to create healing package." });
  }
});

// PUT (Update) a Healing Package
router.put("/healing-packages/:id", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, shortPreview, fee, duration, cta, isActive } = req.body;
  try {
    const updatedPackage = await prisma.healingPackage.update({
      where: { id: id },
      data: { title, shortPreview, fee, duration, cta, isActive },
    });
    res.json(updatedPackage);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found." });
    }
    console.error(`Failed to update package ${id}:`, error);
    res.status(500).json({ error: "Failed to update package." });
  }
});

// DELETE a Healing Package
router.delete("/healing-packages/:id", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.healingPackage.delete({
      where: { id: id },
    });
    res.status(204).send(); // No content
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found." });
    }
    console.error(`Failed to delete package ${id}:`, error);
    res.status(500).json({ error: "Failed to delete package." });
  }
});

// =============================================================
// --- NEW: Healing Suggestion Management (SuperUser/Admin) ---
// =============================================================

// GET all Healing Suggestions
router.get("/healing-suggestions", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  console.log(`User ${req.user.id} requesting /api/admin/healing-suggestions`);
  try {
    const suggestions = await prisma.healingSuggestion.findMany({
      orderBy: { createdAt: "asc" },
    });
    console.log(`Found ${suggestions.length} healing suggestions.`);
    res.json(suggestions);
  } catch (error: any) {
    console.error("Failed to fetch healing suggestions:", error);
    res.status(500).json({ error: "Failed to fetch healing suggestions." });
  }
});

// POST a new Healing Suggestion
router.post("/healing-suggestions", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { text, isActive } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Suggestion text is required." });
  }
  try {
    const newSuggestion = await prisma.healingSuggestion.create({
      data: { text, isActive },
    });
    res.status(201).json(newSuggestion);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "This suggestion already exists." });
    }
    console.error("Failed to create suggestion:", error);
    res.status(500).json({ error: "Failed to create suggestion." });
  }
});

// PUT (Update) a Healing Suggestion
router.put("/healing-suggestions/:id", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text, isActive } = req.body;
  try {
    const updatedSuggestion = await prisma.healingSuggestion.update({
      where: { id: id },
      data: { text, isActive },
    });
    res.json(updatedSuggestion);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Suggestion not found." });
    }
    console.error(`Failed to update suggestion ${id}:`, error);
    res.status(500).json({ error: "Failed to update suggestion." });
  }
});

// DELETE a Healing Suggestion
router.delete(
  "/healing-suggestions/:id",
  isSuperUserOrAdmin,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.healingSuggestion.delete({
        where: { id: id },
      });
      res.status(204).send(); // No content
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Suggestion not found." });
      }
      console.error(`Failed to delete suggestion ${id}:`, error);
      res.status(500).json({ error: "Failed to delete suggestion." });
    }
  }
);

router.get("/clients", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  console.log(`User ${req.user.id} requesting /api/admin/clients`);
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: "GENERAL_USER",
      },
      orderBy: {
        createdAt: "desc", // Show newest clients first
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        frequencyProfile: {
          // Include if the profile exists
          select: {
            id: true,
          },
        },
        healingSubmissions: {
          // Include count of submissions
          select: {
            id: true,
          },
        },
        // We select only non-sensitive information
      },
    });

    console.log(`Found ${clients.length} client accounts.`);
    // We can remap the data slightly for easier frontend consumption
    const clientList = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
      hasProfile: !!client.frequencyProfile, // Simple boolean
      submissionCount: client.healingSubmissions.length,
    }));

    res.json(clientList);
  } catch (error: any) {
    console.error("Failed to fetch clients:", error);
    res.status(500).json({ error: "Failed to fetch clients." });
  }
});

router.get("/clients/:id", isSuperUserOrAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.user.findUnique({
      where: {
        id: id,
        role: "GENERAL_USER", // Ensure we only fetch users with the GENERAL_USER role
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        frequencyProfile: true, // Get the FULL profile object
        healingSubmissions: {
          // Get their full submission history
          orderBy: { createdAt: "desc" },
        },
        visionSubmissions: {
          // Also include their vision submissions
          orderBy: { createdAt: "desc" },
        },
        // Add any other related data you want to show on the profile
      },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }

    res.json(client);
  } catch (error: any) {
    console.error(`Failed to fetch client ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch client details." });
  }
});

/**
 * GET /api/admin/documents/:documentId/download
 * Retrieves a physical file from server storage, protected by admin authentication.
 */
router.get(
  "/documents/:documentId/download",
  isSuperUserOrAdmin,
  async (req: AuthRequest, res: Response) => {
    const { documentId } = req.params;

    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found." });
      }

      // Use the full path stored in the database
      const filePath = document.filePath;

      // Safety check: Ensure the file exists before attempting to send
      if (fs.existsSync(filePath)) {
        // res.download sets the correct Content-Type and Content-Disposition headers
        res.download(filePath, document.originalName, (err) => {
          if (err) {
            console.error(`Error sending file ${documentId}:`, err);
            res
              .status(500)
              .json({ error: "Could not download file due to server error." });
          }
        });
      } else {
        console.error(
          `Physical file not found for Document ID ${documentId}: ${filePath}`
        );
        res.status(404).json({ error: "File not found on server storage." });
      }
    } catch (error: any) {
      console.error("Failed to process document download:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// =============================================================
// --- Infrastructure Submission Routes ---
// =============================================================

/**
 * GET /api/admin/infrastructure-submissions
 * Retrieves a list of all Infrastructure submissions with file metadata.
 */
router.get(
  "/infrastructure-submissions",
  isSuperUserOrAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const submissions = await prisma.infrastructureSubmission.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          // Include the document metadata so we can show if a file exists in the list
          document: {
            select: {
              id: true,
              originalName: true,
              fileSize: true,
              mimeType: true,
            },
          },
          // Include the linked task to show status
          task: {
            select: { id: true, title: true, status: true },
          },
        },
      });
      res.json(submissions);
    } catch (error: any) {
      console.error("Failed to fetch infrastructure submissions list:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch infrastructure submissions list." });
    }
  }
);

/**
 * GET /api/admin/infrastructure-submissions/:id
 * Retrieves a single Infrastructure submission's full details.
 */
router.get(
  "/infrastructure-submissions/:id",
  isSuperUserOrAdmin,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      const submission = await prisma.infrastructureSubmission.findUnique({
        where: { id },
        include: {
          document: true, // Get full document details for the download button
          task: true, // Link to the task
          user: {
            // Info about the registered user (if applicable)
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!submission) {
        return res
          .status(404)
          .json({ error: "Infrastructure submission not found." });
      }

      res.json(submission);
    } catch (error: any) {
      console.error(
        "Failed to fetch infrastructure submission details:",
        error
      );
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// =========================================================================
// 8. INFRASTRUCTURE SUGGESTION MANAGEMENT (SUPER_USER ONLY)
// =========================================================================
router.get("/infrastructure-suggestions", async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = await prisma.infrastructureSuggestion.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(suggestions);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch suggestions." });
  }
});

router.post("/infrastructure-suggestions", async (req: AuthRequest, res: Response) => {
  const { text, isActive = true } = req.body;
  try {
    const suggestion = await prisma.infrastructureSuggestion.create({
      data: { text, isActive },
    });
    res.status(201).json(suggestion);
  } catch (e: any) {
    res
      .status(400)
      .json({ error: "Suggestion creation failed (Is text unique?)." });
  }
});

router.put("/infrastructure-suggestions/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text, isActive } = req.body;
  try {
    const suggestion = await prisma.infrastructureSuggestion.update({
      where: { id },
      data: { text, isActive },
    });
    res.json(suggestion);
  } catch (e: any) {
    res.status(400).json({ error: "Suggestion update failed." });
  }
});

router.delete("/infrastructure-suggestions/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.infrastructureSuggestion.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: "Suggestion deletion failed." });
  }
});

// =========================================================================
// 9. VISION SUGGESTION MANAGEMENT (SUPER_USER ONLY)
// =========================================================================
router.get("/vision-suggestions", async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = await prisma.visionSuggestion.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(suggestions);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch suggestions." });
  }
});

router.post("/vision-suggestions", async (req: AuthRequest, res: Response) => {
  const { text, isActive = true } = req.body;
  try {
    const suggestion = await prisma.visionSuggestion.create({
      data: { text, isActive },
    });
    res.status(201).json(suggestion);
  } catch (e: any) {
    res
      .status(400)
      .json({ error: "Suggestion creation failed (Is text unique?)." });
  }
});

router.put("/vision-suggestions/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text, isActive } = req.body;
  try {
    const suggestion = await prisma.visionSuggestion.update({
      where: { id },
      data: { text, isActive },
    });
    res.json(suggestion);
  } catch (e: any) {
    res.status(400).json({ error: "Suggestion update failed." });
  }
});

router.delete("/vision-suggestions/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.visionSuggestion.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: "Suggestion deletion failed." });
  }
});

// =========================================================================
// 9. EXTRACT TEXT FROM UPLOADED PILOT DOCUMENT (REAL IMPLEMENTATION)
router.post(
  "/pilots/extract-text",
  upload.single("contentFile"),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    let extractedText = "";
    let errorOccurred = false;

    try {
      if (mimeType === "text/plain") {
        // 1. Handle Plain Text (Direct Read)
        extractedText = fs.readFileSync(filePath, "utf8");
      } else if (mimeType === "application/pdf") {
        // 2. Handle PDF (Requires 'pdf-parse')
        const dataBuffer = fs.readFileSync(filePath);

        // The function call remains the same, but the variable 'pdfParse' is now guaranteed to be the function
        const data = await pdfParse(dataBuffer);

        extractedText = data.text;
      } else if (
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // 3. Handle DOCX (Requires 'mammoth')
        const result = await mammoth.convertToHtml({ path: filePath });
        extractedText = result.value;
      } else {
        // Unsupported type
        extractedText = `--- ERROR: File type (${mimeType}) is not supported for automatic extraction. Please enter content manually. ---`;
        errorOccurred = true;
      }

      if (!errorOccurred) {
        extractedText =
          `# Extracted Content from ${req.file.originalname}\n\n` +
          extractedText;
      }
    } catch (e: any) {
      errorOccurred = true;
      console.error(`Extraction failed for ${mimeType}:`, e);
      // Provide a more helpful error message in the field
      extractedText = `--- ERROR: Failed to process file content. Reason: ${
        e.message || "Check server logs for details."
      } ---`;
    } finally {
      // Crucial: Clean up the temporary file immediately
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Send the extracted text back to the client
    res.status(200).json({
      markdownText: extractedText,
      originalName: req.file.originalname,
      success: !errorOccurred,
    });
  }
);
export default router;
