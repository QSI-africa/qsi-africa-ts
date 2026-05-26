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
        { channel: { title: { contains: search, mode: "insensitive" } } },
        { channel: { user: { name: { contains: search, mode: "insensitive" } } } }
      ];
    }

    const recordings = await prisma.labRecording.findMany({
      where,
      include: {
        category: true,
        channel: {
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
    let subscribedChannelIds = new Set();

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
          const mySubscriptions = await prisma.tvSubscription.findMany({
            where: { subscriberId: userId }
          });
          subscribedChannelIds = new Set(mySubscriptions.map((sub) => sub.channelId));
        }
      } catch (err) {
        // Ignore invalid token, act as guest
      }
    }

    const mappedRecordings = recordings.map((rec) => {
      const isOwner = userId ? rec.channel.userId === userId : false;
      const isSubscribed = subscribedChannelIds.has(rec.channelId);
      const hasAccess = isOwner || isSubscribed || isAdmin;

      return {
        id: rec.id,
        title: rec.title,
        description: rec.description,
        categoryId: rec.categoryId,
        categoryTitle: rec.category.title,
        channelId: rec.channelId,
        channelTitle: rec.channel.title,
        teacherName: rec.channel.user.name || rec.channel.user.email,
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
    const myChannel = await prisma.tvChannel.findUnique({
      where: { userId: req.user.id }
    });

    if (!myChannel || myChannel.status !== "APPROVED") {
      return res.status(403).json({ error: "Only approved teachers can publish recordings." });
    }

    const { title, description, mediaUrl, mimeType, categoryId } = req.body;
    if (!title || !mediaUrl || !mimeType || !categoryId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const recording = await prisma.labRecording.create({
      data: {
        channelId: myChannel.id,
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
      include: { channel: true }
    });

    if (!recording) {
      return res.status(404).json({ error: "Recording not found." });
    }

    const isOwner = recording.channel.userId === req.user.id;
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
