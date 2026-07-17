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

// NEW ROUTE: Get all members for the Sovereign Minds page
router.get("/all-members", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        engineerProfile: true
      }
    });

    const members = users.map(user => {
      if (user.engineerProfile) {
        return {
          ...user.engineerProfile,
          user: { name: user.name, email: user.email, role: user.role }
        };
      } else {
        return {
          id: user.id, // Fallback ID so we have a key in React
          userId: user.id,
          bio: "",
          specialization: "General User",
          skills: [],
          isVerified: false,
          user: { name: user.name, email: user.email, role: user.role },
          projects: []
        };
      }
    });

    res.status(200).json(members);
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
        images: true,
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
      update: { bio, specialization, skills, avatarUrl },
      create: { userId, bio, specialization, skills, avatarUrl }
    });

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
    const profile = await prisma.engineerProfile.findUnique({ where: { userId } });
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

// 5. Get individual profile with insights
router.get("/profile/:id", async (req, res) => {
  try {
    let profile = await prisma.engineerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, role: true } },
        projects: true,
        insights: true
      }
    });
    
    if (!profile) {
      profile = await prisma.engineerProfile.findUnique({
        where: { userId: req.params.id },
        include: {
          user: { select: { name: true, email: true, role: true } },
          projects: true,
          insights: true
        }
      });
    }

    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id }
      });
      if (user) {
        return res.status(200).json({
          id: user.id,
          userId: user.id,
          bio: "",
          specialization: "General User",
          skills: [],
          isVerified: false,
          user: { name: user.name, email: user.email, role: user.role },
          projects: [],
          insights: []
        });
      }
      return res.status(404).json({ error: "Profile not found." });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 6. Post a sovereign insight (Sovereign Minds only)
router.post("/insights", authMiddleware, async (req, res) => {
  const { title, content, category } = req.body;
  const userId = req.user.id;

  try {
    const profile = await prisma.engineerProfile.findUnique({ where: { userId } });
    if (!profile || !profile.isVerified) {
      return res.status(403).json({ error: "Only verified Sovereign Minds can post insights." });
    }

    const insight = await prisma.sovereignInsight.create({
      data: { profileId: profile.id, title, content, category }
    });

    res.status(201).json(insight);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// 7. Get individual sovereign insight
router.get("/insights/:id", async (req, res) => {
  try {
    const insight = await prisma.sovereignInsight.findUnique({
      where: { id: req.params.id },
      include: {
        profile: {
          include: {
            user: { select: { name: true, role: true } }
          }
        }
      }
    });
    if (!insight) return res.status(404).json({ error: "Insight not found." });
    res.status(200).json(insight);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
