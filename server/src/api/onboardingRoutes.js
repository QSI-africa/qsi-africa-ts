// server/src/api/onboardingRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { generateFrequencyProfile } = require("../services/aiService");
const router = express.Router();

router.post("/profile", authMiddleware, async (req, res) => {
  // Protected route
  const userId = req.user.id;
  const profileData = req.body; // { fullName, location, ... }

  const existingProfile = await prisma.frequencyProfile.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    return res.status(400).json({ error: "Profile already exists." });
  }
  try {
    const aiGeneratedProfile = await generateFrequencyProfile(profileData);
    const newProfile = await prisma.frequencyProfile.create({
      data: {
        userId: userId,
        location: profileData.location,
        personalBeliefs: profileData.personalBeliefs,
        background: profileData.background,
        lifeVision: profileData.lifeVision,
        challenges: profileData.challenges,
        generatedProfile: aiGeneratedProfile,
      },
    });
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Failed to create profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
 