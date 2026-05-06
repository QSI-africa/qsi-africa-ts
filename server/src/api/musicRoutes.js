const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

// Get all music tracks
router.get("/tracks", async (req, res) => {
  const { category } = req.query;
  try {
    const tracks = await prisma.musicTrack.findMany({
      where: {
        category: category || undefined
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(tracks);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
