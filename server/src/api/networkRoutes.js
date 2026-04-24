// server/src/api/networkRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// 1. Get all engineers (Filtered)
router.get("/engineers", async (req, res) => {
  const { specialization, isVerified } = req.query;
  
  try {
    const engineers = await prisma.engineerProfile.findMany({
      where: {
        specialization: specialization || undefined,
        isVerified: isVerified === "true" ? true : undefined
      },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        },
        projects: true
      }
    });
    res.status(200).json(engineers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. Get all project showcases
router.get("/projects", async (req, res) => {
  const { status } = req.query;
  
  try {
    const projects = await prisma.projectShowcase.findMany({
      where: {
        status: status || undefined
      },
      include: {
        images: true, // Include the gallery
        engineerProfile: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. Create or update engineer profile
router.post("/profile", authMiddleware, async (req, res) => {
  const { bio, specialization, skills, avatarUrl } = req.body;
  const userId = req.user.id;

  try {
    const profile = await prisma.engineerProfile.upsert({
      where: { userId },
      update: {
        bio,
        specialization,
        skills,
        avatarUrl
      },
      create: {
        userId,
        bio,
        specialization,
        skills,
        avatarUrl
      }
    });

    // Also upgrade user role to ENGINEER if it was GENERAL_USER
    if (req.user.role === "GENERAL_USER") {
       await prisma.user.update({
         where: { id: userId },
         data: { role: "ENGINEER" }
       });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. Add project to showcase
router.post("/projects", authMiddleware, async (req, res) => {
  const { title, description, status, imageUrl } = req.body;
  const userId = req.user.id;

  try {
    const profile = await prisma.engineerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(400).json({ error: "Please create an engineer profile first." });
    }

    const project = await prisma.projectShowcase.create({
      data: {
        engineerProfileId: profile.id,
        title,
        description,
        status: status || "PLANNED",
        imageUrl
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
