const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get my notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Mark as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true }
    });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
