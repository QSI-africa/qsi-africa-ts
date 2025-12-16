// server/src/index.ts
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import submissionRoutes from './api/submissionRoutes';
import authRoutes from './api/authRoutes';
import adminRoutes from './api/adminRoutes';
import onboardingRoutes from './api/onboardingRoutes';
import invoicingRoutes from './api/invoicingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Main chatbot routes
app.use("/api/submit", submissionRoutes);
// Admin portal auth routes
app.use("/api/auth", authRoutes);
// Admin data routes (protected)
app.use("/api/admin", adminRoutes);
// Onboarding routes
app.use("/api/onboarding", onboardingRoutes);
// Invoicing Routes
app.use("/api/invoicing", invoicingRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ 
    message: "QSI Africa API Server",
    status: "running",
    version: "1.0.0 (TypeScript)",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      submissions: "/api/submit",
      admin: "/api/admin",
      onboarding: "/api/onboarding",
      invoicing: "/api/invoicing"
    }
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`QSI server listening on port ${PORT}`);
});
