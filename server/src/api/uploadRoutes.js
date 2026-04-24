// server/src/api/uploadRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");
const path = require("path");

const router = express.Router();

// Upload a generic document (Resume, Certificate, etc.)
router.post("/document", authMiddleware, uploadSingle("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { category, documentType } = req.body;
  const userId = req.user.id;

  try {
    const document = await prisma.document.create({
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
        fileSize: req.file.size,
        category: category || "GENERAL",
        documentType: documentType || "GENERAL",
        userId: userId
      }
    });

    // If it's a resume, also update the EngineerProfile
    if (category === "RESUME") {
       const engineerProfile = await prisma.engineerProfile.findUnique({
         where: { userId }
       });
       if (engineerProfile) {
         await prisma.engineerProfile.update({
           where: { id: engineerProfile.id },
           data: { resumeUrl: `/uploads/${req.file.filename}` }
         });
       }
    }

    res.status(201).json({
      message: "File uploaded successfully",
      document: {
        id: document.id,
        url: `/uploads/${document.fileName}`,
        name: document.originalName
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Upload a project image
router.post("/project-image", authMiddleware, uploadSingle("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { projectId, caption } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required." });
  }

  try {
    const projectImage = await prisma.projectImage.create({
      data: {
        projectId,
        imageUrl: `/uploads/${req.file.filename}`,
        caption: caption || ""
      }
    });

    res.status(201).json(projectImage);
  } catch (error) {
    console.error("Project image upload error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get user's documents
router.get("/my-documents", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
