const express = require("express");
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

module.exports = router;
