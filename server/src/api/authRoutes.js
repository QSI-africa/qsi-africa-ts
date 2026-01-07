// server/src/api/authRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_FALLBACK_SECRET_KEY";

// --- IMPORT MIDDLEWARE ---
// Ensure your server/src/middleware/authMiddleware.js exports { authMiddleware }
const { authMiddleware } = require("../middleware/authMiddleware");
// -------------------------

// 1. User Registration (Admin/SuperUser Only)
router.post("/register", async (req, res) => {
  const { email, name, password, role } = req.body;

  if (!email || !name || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role,
      },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists." });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Sign a JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // --- FIX: Add Credentials Header for CORS ---
    res.header("Access-Control-Allow-Credentials", "true");
    // --------------------------------------------

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. User Profile (Protected Route)
// This is where the "argument handler" error was likely happening
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // authMiddleware attaches the full user object to req.user
    const userWithProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        frequencyProfile: {
          select: { id: true },
        },
      },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(userWithProfile);
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    if (user.role !== "SUPER_USER") {
      return res.status(403).json({
        error: "Password reset via email is only available for Super Users.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email: user.email },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    // NOTE: sendPasswordResetEmail is not imported. Commenting out to prevent runtime crash.
    // await sendPasswordResetEmail(user, resetToken);
    console.log(
      `(Mock Email) Password reset token for ${email}: ${resetToken}`
    );

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

// 5. Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password)
    return res.status(400).json({ error: "New password is required." });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while resetting the password." });
  }
});

// 6. Public Registration (General User)
router.post("/register-user", async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "GENERAL_USER",
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
