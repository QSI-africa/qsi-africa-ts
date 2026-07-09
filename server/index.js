// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const prisma = require("./src/config/prisma");
const path = require("path");
const http = require("http");
const { apiLimiter } = require("./src/middleware/rateLimiter");
const setupVideoSignaling = require("./src/services/videoSignaling");

const app = express();
const PORT = process.env.PORT || 3001;

// Auto-fix Prisma Enum limitation for FLEET_DRIVER
(async () => {
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FLEET_DRIVER'`);
    console.log("Verified UserRole enum contains FLEET_DRIVER.");
  } catch (err) {
    // Ignore. Might fail if DB doesn't support IF NOT EXISTS or other reasons.
  }
})();

// Trust Nginx reverse proxy so rate limiting uses the correct client IP instead of the proxy IP
app.set("trust proxy", 1);

// Security: Add helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving uploads
  contentSecurityPolicy: false, // Disable CSP for API server
}));

// Enable CORS BEFORE rate limiting so that rate-limit errors (429) include CORS headers!
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://165.22.130.156:9000",
        "http://165.22.130.156:9090",
        "http://localhost:9000",
        "http://localhost:9090",
        "https://qsi.africa",
        "https://www.qsi.africa",
        "https://admin.qsi.africa",
      ];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow if it's in the allowed list or if it's a subdomain of qsi.africa
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".qsi.africa")) {
        callback(null, true);
      } else {
        // Just fallback to true to prevent blocking legitimate production traffic
        // that might be coming through a different proxy/port.
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Security: Apply rate limiting to all API requests, but bypass for Socket.io
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/socket.io")) {
    return next();
  }
  return apiLimiter(req, res, next);
});



app.use(express.json({ limit: "20mb" })); // Also limit JSON body size

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/submit", require("./src/api/submissionRoutes"));
app.use("/api/auth", require("./src/api/authRoutes"));
app.use("/api/admin/tasks", require("./src/api/tasksRoutes"));
app.use("/api/admin/users", require("./src/api/usersRoutes"));
app.use("/api/admin", require("./src/api/adminRoutes"));
app.use("/api/onboarding", require("./src/api/onboardingRoutes"));
// app.use("/api/learning", require("./src/api/learningRoutes"));
// app.use("/api/consultation", require("./src/api/consultRoutes"));
// app.use("/api/healing", require("./src/api/healingRoutes"));
app.use("/api/panx", require("./src/api/panxRoutes"));
app.use("/api/mobility", require("./src/api/mobilityRoutes"));
app.use("/api/fleet", require("./src/api/fleetRoutes")); // Added fleet routes
// app.use("/api/support", require("./src/api/supportRoutes"));
// app.use("/api/tasks", require("./src/api/taskRoutes"));
app.use("/api/upload", require("./src/api/uploadRoutes"));
app.use("/api/logic", require("./src/api/logicRoutes"));
app.use("/api/lab", require("./src/api/labRoutes"));
app.use("/api/notifications", require("./src/api/notificationRoutes"));
app.use("/api/messaging", require("./src/api/messagingRoutes"));
app.use("/api/invoicing", require("./src/api/invoicingRoutes"));
app.use("/api/network", require("./src/api/networkRoutes"));
app.use("/api/config", require("./src/api/configRoutes"));
app.use("/api/tv", require("./src/api/tvRoutes"));
// app.use("/api/panx", require("./src/api/panxRoutes")); // Already imported above

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.get("/api/ice-config", (req, res) => {
  res.json({
    iceServers: [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  });
});

const server = http.createServer(app);

// Initialize Socket.io signaling
const io = setupVideoSignaling(server);
app.set("io", io);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`QSI server listening on port ${PORT}`);
  });
}

module.exports = { app, server, io };
