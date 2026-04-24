// server/src/api/logicRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit a healing inquiry
router.post("/healing-inquiry", authMiddleware, async (req, res) => {
  const { packageId, message, preference } = req.body;
  const userId = req.user.id;

  try {
    const submission = await prisma.healingSubmission.create({
      data: {
        userId,
        // message is mapped to concerns/goals in the schema
        concerns: message,
        // sessionMode can be used if we update the schema, otherwise just use message
        packageId,
      }
    });

    // Notify Admins (Logic for global notifications could go here)
    // For now, just return success
    res.status(201).json(submission);
  } catch (error) {
    console.error("Healing inquiry error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
