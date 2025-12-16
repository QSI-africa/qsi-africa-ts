// server/src/api/onboardingRoutes.js
import express, { Response, Router, NextFunction } from 'express';
import prisma from '../config/prisma';
import {  authMiddleware, AuthRequest  } from '../middleware/authMiddleware';
import {  generateFrequencyProfile  } from '../services/aiService';
const router: Router = express.Router();

router.post("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  // Protected route
  const userId = req.user!.id;
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
  } catch (error: any) {
    console.error("Failed to create profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
 
