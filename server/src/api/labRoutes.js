const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all lab categories with their packages
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.labCategory.findMany({
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Admin: Upsert category
router.post("/categories", authMiddleware, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_USER") {
    return res.status(403).json({ error: "Unauthorized." });
  }

  const { id, title, descriptor, icon, order } = req.body;
  try {
    const category = await prisma.labCategory.upsert({
      where: { id: id || "new-category" },
      update: { title, descriptor, icon, order },
      create: { title, descriptor, icon, order }
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Admin: Upsert package
router.post("/packages", authMiddleware, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_USER") {
    return res.status(403).json({ error: "Unauthorized." });
  }

  const { id, categoryId, name, level, duration, description, isActive, order } = req.body;
  try {
    const pkg = await prisma.labPackage.upsert({
      where: { id: id || "new-package" },
      update: { categoryId, name, level, duration, description, isActive, order },
      create: { categoryId, name, level, duration, description, isActive, order }
    });
    res.status(200).json(pkg);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Admin: Delete category
router.delete("/categories/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_USER") {
    return res.status(403).json({ error: "Unauthorized." });
  }
  try {
    await prisma.labCategory.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Lab Recordings Endpoints ---

// Get all lab recordings (gated by subscription status)
router.get("/recordings", async (req, res) => {
  const { search, categoryId } = req.query;
  try {
    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { teacher: { title: { contains: search, mode: "insensitive" } } },
        { teacher: { user: { name: { contains: search, mode: "insensitive" } } } }
      ];
    }

    const recordings = await prisma.labRecording.findMany({
      where,
      include: {
        category: true,
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Check subscriber status of current user (if logged in)
    let userId = null;
    let isAdmin = false;
    let subscribedTeacherIds = new Set();

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-change-me";
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true }
        });
        if (user) {
          isAdmin = user.role === "ADMIN" || user.role === "SUPER_USER";
          const mySubscriptions = await prisma.labSubscription.findMany({
            where: { subscriberId: userId }
          });
          subscribedTeacherIds = new Set(mySubscriptions.map((sub) => sub.teacherId));
        }
      } catch (err) {
        // Ignore invalid token, act as guest
      }
    }

    const mappedRecordings = recordings.map((rec) => {
      const isOwner = userId && rec.teacher ? rec.teacher.userId === userId : false;
      const isSubscribed = rec.teacher ? subscribedTeacherIds.has(rec.teacher.id) : false;
      const hasAccess = isOwner || isSubscribed || isAdmin;

      return {
        id: rec.id,
        title: rec.title,
        description: rec.description,
        categoryId: rec.categoryId,
        categoryTitle: rec.category.title,
        teacherId: rec.teacher?.id,
        channelTitle: rec.teacher?.title || "Unknown",
        teacherName: rec.teacher?.user?.name || rec.teacher?.user?.email || "Unknown",
        mimeType: rec.mimeType,
        createdAt: rec.createdAt,
        isLocked: !hasAccess,
        mediaUrl: hasAccess ? rec.mediaUrl : null
      };
    });

    res.status(200).json(mappedRecordings);
  } catch (error) {
    console.error("Failed to fetch recordings:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Publish a new lab recording (Approved Broadcasters/Teachers only)
router.post("/recordings", authMiddleware, async (req, res) => {
  try {
    const myTeacherProfile = await prisma.labTeacherProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!myTeacherProfile || myTeacherProfile.status !== "APPROVED") {
      return res.status(403).json({ error: "Only approved teachers can publish recordings." });
    }

    const { title, description, mediaUrl, mimeType, categoryId } = req.body;
    if (!title || !mediaUrl || !mimeType || !categoryId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const recording = await prisma.labRecording.create({
      data: {
        teacherId: myTeacherProfile.id,
        categoryId,
        title,
        description,
        mediaUrl,
        mimeType
      }
    });

    res.status(201).json(recording);
  } catch (error) {
    console.error("Failed to create recording:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Delete a lab recording (Owner or Admin only)
router.delete("/recordings/:id", authMiddleware, async (req, res) => {
  try {
    const recording = await prisma.labRecording.findUnique({
      where: { id: req.params.id },
      include: { teacher: true }
    });

    if (!recording) {
      return res.status(404).json({ error: "Recording not found." });
    }

    const isOwner = recording.teacher && recording.teacher.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN" || req.user.role === "SUPER_USER";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized to delete this recording." });
    }

    await prisma.labRecording.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete recording:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Lab Teacher Profile Endpoints ---

// Get current user's teacher profile
router.get("/teacher/my-profile", authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.labTeacherProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    });
    res.json(profile);
  } catch (error) {
    console.error("Failed to fetch teacher profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request or update teacher profile
router.post("/teacher/request", authMiddleware, async (req, res) => {
  const { title, bio } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required." });

  try {
    const existing = await prisma.labTeacherProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const profile = await prisma.labTeacherProfile.create({
      data: {
        userId: req.user.id,
        title,
        bio: bio || "",
        status: "PENDING"
      }
    });
    res.status(201).json(profile);
  } catch (error) {
    console.error("Failed to request teacher profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Subscribe to a teacher
router.post("/teacher/:teacherId/subscribe", authMiddleware, async (req, res) => {
  const { teacherId } = req.params;
  const subscriberId = req.user.id;

  try {
    const teacher = await prisma.labTeacherProfile.findUnique({
      where: { id: teacherId }
    });

    if (!teacher || teacher.status !== "APPROVED") {
      return res.status(404).json({ error: "Teacher not found or not approved." });
    }

    if (teacher.userId === subscriberId) {
      return res.status(400).json({ error: "Cannot subscribe to yourself." });
    }

    const sub = await prisma.labSubscription.upsert({
      where: {
        subscriberId_teacherId: { subscriberId, teacherId }
      },
      update: {},
      create: { subscriberId, teacherId }
    });
    res.status(201).json(sub);
  } catch (error) {
    console.error("Failed to subscribe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unsubscribe from a teacher
router.post("/teacher/:teacherId/unsubscribe", authMiddleware, async (req, res) => {
  const { teacherId } = req.params;
  const subscriberId = req.user.id;

  try {
    await prisma.labSubscription.delete({
      where: {
        subscriberId_teacherId: { subscriberId, teacherId }
      }
    });
    res.status(200).json({ message: "Unsubscribed" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check subscription status
router.get("/teacher/:teacherId/subscription-status", authMiddleware, async (req, res) => {
  const { teacherId } = req.params;
  try {
    const sub = await prisma.labSubscription.findUnique({
      where: {
        subscriberId_teacherId: { subscriberId: req.user.id, teacherId }
      }
    });
    res.status(200).json({ subscribed: !!sub });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all package enrollments for the logged-in user
router.get("/enrollments", authMiddleware, async (req, res) => {
  try {
    const enrollments = await prisma.labEnrollment.findMany({
      where: { userId: req.user.id }
    });
    res.status(200).json(enrollments.map(e => e.packageId));
  } catch (error) {
    console.error("Failed to fetch enrollments:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Toggle package enrollment for the logged-in user
router.post("/packages/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const packageId = req.params.id;
    const userId = req.user.id;

    // Check if package exists
    const pkg = await prisma.labPackage.findUnique({
      where: { id: packageId }
    });
    if (!pkg) {
      return res.status(404).json({ error: "Package not found." });
    }

    // Toggle enrollment
    const existing = await prisma.labEnrollment.findUnique({
      where: {
        userId_packageId: { userId, packageId }
      }
    });

    if (existing) {
      await prisma.labEnrollment.delete({
        where: {
          userId_packageId: { userId, packageId }
        }
      });
    } else {
      await prisma.labEnrollment.create({
        data: { userId, packageId }
      });
    }

    // Return the updated list of enrolled package IDs
    const updatedEnrollments = await prisma.labEnrollment.findMany({
      where: { userId }
    });
    res.status(200).json(updatedEnrollments.map(e => e.packageId));
  } catch (error) {
    console.error("Failed to toggle enrollment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
