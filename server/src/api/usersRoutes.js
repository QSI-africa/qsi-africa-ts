const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware, isSuperUser } = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// Apply auth middleware
router.use(authMiddleware);

// GET /api/admin/users
router.get("/", isSuperUser, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [
            "TEAM_MEMBER",
            "SUPER_USER",
            "ENGINEER",
            "ARCHITECT",
            "QUANTITY_SURVEYOR",
          ],
        },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" }, // Optional: Order users alphabetically
    });
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error); // Log error
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// POST /api/admin/users (Create User)
router.post("/", isSuperUser, async (req, res) => {
  const { email, name, password, role } = req.body;
  if (!email || !name || !password || !role) {
    return res
      .status(400)
      .json({ error: "Email, name, password, and role are required." });
  }
  // Optional: Validate role is one of the allowed assignable roles
  const allowedRoles = [
    "TEAM_MEMBER",
    "ENGINEER",
    "ARCHITECT",
    "QUANTITY_SURVEYOR",
    "SUPER_USER",
    "ADMIN",
  ];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid user role specified." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }, // Don't return password
    });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "P2002") {
      // Unique constraint violation
      return res.status(400).json({ error: "Email already exists." });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
});

// PUT /api/admin/users/:userId (Update User Name/Role)
router.put("/:userId", isSuperUser, async (req, res) => {
  const { userId } = req.params;
  const { name, role } = req.body;
  let dataToUpdate = {};

  if (name) dataToUpdate.name = name;
  if (role) {
    // Optional: Validate role
    const allowedRoles = [
      "TEAM_MEMBER",
      "ENGINEER",
      "ARCHITECT",
      "QUANTITY_SURVEYOR",
      "SUPER_USER",
      "ADMIN",
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid user role specified." });
    }
    dataToUpdate.role = role;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return res
      .status(400)
      .json({ error: "No update data provided (name or role)." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "User not found." });
    }
    console.error(`Update user ${userId} error:`, error);
    res.status(500).json({ error: "Failed to update user." });
  }
});

// PUT /api/admin/users/:userId/reset-password
router.put("/:userId/reset-password", isSuperUser, async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "New password is required." });
  }
  if (req.user.id === userId) {
    return res.status(400).json({
      error:
        "Super User cannot reset their own password here. Use the forgot password flow.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // Also clear any pending email reset tokens for this user
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    res.status(200).json({ message: "User password reset successfully." });
  } catch (error) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "User not found." });
    }
    console.error(`Reset password for user ${userId} error:`, error);
    res.status(500).json({ error: "Failed to reset user password." });
  }
});

// DELETE /api/admin/users/:userId
router.delete("/:userId", isSuperUser, async (req, res) => {
  const { userId } = req.params;

  if (req.user.id === userId) {
    return res.status(400).json({ error: "Cannot delete your own account." });
  }

  try {
    // Simple deletion for now. Add constraints/cleanup logic as needed.
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(204).send(); // No content on successful delete
  } catch (error) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "User not found." });
    }
    // Handle constraint errors if user is linked to tasks/logs
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Cannot delete user. They are linked to existing tasks or logs. Reassign tasks first.",
      });
    }
    console.error(`Delete user ${userId} error:`, error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

module.exports = router;
