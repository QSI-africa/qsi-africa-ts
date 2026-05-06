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

// Security: Add helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving uploads
  contentSecurityPolicy: false, // Disable CSP for API server
}));

// Security: Apply rate limiting to all API requests
// Security: Apply rate limiting to all API requests, but bypass for Socket.io
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/socket.io")) {
    return next();
  }
  return apiLimiter(req, res, next);
});

// Enable CORS for specific origins
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://165.22.130.156:9000",
      "http://165.22.130.156:9090",
      "http://localhost:9000",
      "http://localhost:9090",
      "https://qsi.africa",
      "https://www.qsi.africa",
      "https://admin.qsi.africa",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // Also limit JSON body size

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/submit", require("./src/api/submissionRoutes"));
app.use("/api/auth", require("./src/api/authRoutes"));
app.use("/api/admin/tasks", require("./src/api/tasksRoutes"));
app.use("/api/admin/users", require("./src/api/usersRoutes"));
app.use("/api/admin", require("./src/api/adminRoutes"));
app.use("/api/onboarding", require("./src/api/onboardingRoutes"));
app.use("/api/invoicing", require("./src/api/invoicingRoutes"));
app.use("/api/mobility", require("./src/api/mobilityRoutes"));
app.use("/api/network", require("./src/api/networkRoutes"));
app.use("/api/upload", require("./src/api/uploadRoutes"));
app.use("/api/logic", require("./src/api/logicRoutes"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

const server = http.createServer(app);

// Initialize Socket.io signaling
const io = setupVideoSignaling(server);
app.set("io", io);

server.listen(PORT, () => {
  console.log(`QSI server listening on port ${PORT}`);
});
