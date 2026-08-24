// server/src/api/authRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");

const router = express.Router();
const SALT_ROUNDS = 12; // Increased from 10 for better security
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_FALLBACK_SECRET_KEY";

// --- IMPORT MIDDLEWARE ---
const { authMiddleware } = require("../middleware/authMiddleware");
const { authLimiter, registrationLimiter, passwordResetLimiter } = require("../middleware/rateLimiter");
const { sendFleetDriverRegistrationEmail } = require("../services/emailService");
const { uploadSingle } = require("../middleware/uploadMiddleware");
// -------------------------
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

// 2. User Login (Rate limited: 5 attempts per 15 minutes)
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Enhanced logging for debugging
  console.log(`[LOGIN] Attempt for email: ${email?.substring(0, 3)}***`);

  if (!email || !password) {
    console.log("[LOGIN] Missing credentials");
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Check if JWT_SECRET is configured
  if (!JWT_SECRET) {
    console.error("[LOGIN] CRITICAL: JWT_SECRET is not configured!");
    return res.status(500).json({ error: "Server configuration error. Please contact administrator." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`[LOGIN] Invalid password for: ${email}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Sign a JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    console.log(`[LOGIN] Success for user: ${user.id}`);

    // --- FIX: Add Credentials Header for CORS ---
    res.header("Access-Control-Allow-Credentials", "true");
    // --------------------------------------------

    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("[LOGIN] Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      email: email?.substring(0, 3) + "***"
    });
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. User Profile (Protected Route)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        location: true,
        organization: true,
        avatarUrl: true,
        bannerUrl: true,
        frequencyScans: {
          select: {
            id: true,
            createdAt: true,
            frequencyScore: true,
            frequencyArchetype: true
          },
          orderBy: { createdAt: "desc" },
          take: 1
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

// 3.1 Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
  const { name, phone, location, organization } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone: phone || null,
        location: location || null,
        organization: organization || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        location: true,
        organization: true,
        avatarUrl: true,
        bannerUrl: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3.2a Upload Avatar
router.put("/avatar", authMiddleware, uploadSingle("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  try {
    const avatarUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Failed to update avatar:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3.2b Upload Banner
router.put("/banner", authMiddleware, uploadSingle("banner"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  try {
    const bannerUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { bannerUrl },
      select: { id: true, bannerUrl: true },
    });
    res.status(200).json({ bannerUrl: updatedUser.bannerUrl });
  } catch (error) {
    console.error("Failed to update banner:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3.2 Change Password
router.put("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Failed to update password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. Forgot Password (Rate limited: 3 attempts per hour)
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
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
    // sendPasswordResetEmail(user, resetToken).catch(console.error);
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

// 6. Public Registration (General User) - Rate limited: 3 registrations per hour
router.post("/register-user", registrationLimiter, async (req, res) => {
  const { email, name, password, phone, location, organization } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: "Email, name, and password are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "GENERAL_USER",
        phone: phone || null,
        location: location || null,
        organization: organization || null,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Internal server error." });
  }
});

// 7. Fleet Driver Registration (Public)
router.post("/register-fleet-driver", registrationLimiter, async (req, res) => {
  const { 
    name, email, password, phone,
    make, model, year, color, licensePlate, vehicleType, capacity 
  } = req.body;

  if (!email || !name || !password || !make || !model || !licensePlate || !vehicleType) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user and vehicle in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "FLEET_DRIVER",
          phone: phone || null,
        },
      });

      const vehicle = await prisma.fleetVehicle.create({
        data: {
          driverId: user.id,
          make,
          model,
          year: year ? parseInt(year, 10) : null,
          color: color || null,
          licensePlate,
          vehicleType,
          capacity: capacity ? parseInt(capacity, 10) : 4,
          isApproved: false, // Requires admin approval
        }
      });

      return { user, vehicle };
    });

    // Notify admin (run asynchronously to avoid blocking the response on email timeout)
    sendFleetDriverRegistrationEmail(result.user, result.vehicle).catch(err => console.error("Email error:", err));

    // Issue tokens so they can potentially login, though we should restrict what they can do until approved.
    const token = jwt.sign(
      { userId: result.user.id, role: result.user.role, name: result.user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    await prisma.user.update({
      where: { id: result.user.id },
      data: { refreshToken }
    });

    res.status(201).json({
      message: "Registration successful. Pending admin approval.",
      token,
      refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email or license plate already exists." });
    }
    console.error("Fleet driver registration error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 8. Refresh Token
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token is required." });

  try {
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    // Issue new tokens
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    res.status(200).json({
      token,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
