// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const prisma = require("./src/config/prisma");
const path = require("path");
const { apiLimiter } = require("./src/middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Add helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving uploads
  contentSecurityPolicy: false, // Disable CSP for API server
}));

// Security: Apply rate limiting to all API requests
app.use("/api", apiLimiter);

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

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`QSI server listening on port ${PORT}`);
});
