// server/src/api/adminRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { sendTaskAssignmentEmail } = require("../services/emailService");
const router = express.Router();
const bcrypt = require("bcrypt");
const { extractTextFromFile } = require("../utils/textExtractor");
const fs = require("fs"); // <-- NEW: Import for file existence checks
const path = require("path"); // <-- NEW: Import for path resolution
const mammoth = require("mammoth");

// Apply the auth middleware to ALL routes in this file
router.use(authMiddleware);

const SALT_ROUNDS = 10;

let pdfParse = require("pdf-parse");
pdfParse = pdfParse?.default || pdfParse;

// Middleware to check if the user is a SUPER_USER
const isSuperUser = (req, res, next) => {
  if (req.user.role !== "SUPER_USER") {
    return res
      .status(403)
      .json({ error: "Forbidden: Requires Super User role." });
  }
  next();
};

const isSuperUserOrAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_USER" && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Forbidden: Requires Super User or Admin role." });
  }
  next();
};


router.get("/healing-submissions", isSuperUserOrAdmin, async (req, res) => {
  try {
    const submissions = await prisma.healingSubmission.findMany({
      orderBy: { createdAt: "desc" }, // Show newest first
    });
    res.json(submissions);
  } catch (error) {
    console.error("Failed to fetch healing submissions:", error);
    res.status(500).json({ error: "Failed to fetch healing submissions." });
  }
});

router.get("/vision-submissions", isSuperUserOrAdmin, async (req, res) => {
  console.log(`User ${req.user.id} requesting /api/admin/vision-submissions`); // Check if this log appears
  try {
    const submissions = await prisma.visionSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`Found ${submissions.length} vision submissions.`); // Check the count here
    res.json(submissions);
  } catch (error) {
    console.error("Failed to fetch vision submissions:", error);
    res.status(500).json({ error: "Failed to fetch vision submissions." });
  }
});

router.get("/pilots", async (req, res) => {
  const { type } = req.query; // Get the 'type' from the query string (e.g., ?type=FRAMEWORK)
  try {
    // Start with the base filter for active pilots
    let whereClause = {};

    // If a valid type is provided (CONCEPT or FRAMEWORK), add it to the filter
    if (type === "CONCEPT" || type === "FRAMEWORK") {
      whereClause.type = type;
    }
    // If no type is provided, it will fetch all active pilots (both types)

    console.log(`Fetching pilots with filter:`, whereClause); // Server log

    const pilots = await prisma.pilotProject.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      select: {
        // Select all fields needed by the client list/detail pages
        id: true,
        key: true,
        title: true,
        subtext: true,
        shortDescription: true,
        expandedView: true, // Send full data for the detail page
        imageUrl: true,
        type: true,
        isActive: true,
      },
    });
    res.json(pilots);
  } catch (error) {
    console.error("Failed to fetch pilot projects list:", error);
    res.status(500).json({ error: "Failed to fetch pilot projects." });
  }
});

// POST /api/admin/pilots (Create a new pilot)
router.post(
  "/pilots",
  isSuperUserOrAdmin,
  upload.single("contentFile"),
  async (req, res) => {
    // Parse the body (multipart/form-data turns everything to strings, so we might need to parse booleans)
    const body = req.body;
    const { key, title, subtext, shortDescription, imageUrl } = body;
    const isActive = body.isActive === "true" || body.isActive === true;
    const type = body.type || "CONCEPT";

    let expandedView = body.expandedView || "";

    // 1. If a file was uploaded, extract text from it
    if (req.file) {
      try {
        const fileText = await extractTextFromFile(req.file);
        // If user provided text manually, append the file text, otherwise just use file text
        expandedView = expandedView
          ? `${expandedView}\n\n${fileText}`
          : fileText;

        // Optional: Delete the file after extraction if you don't want to store the source doc
        // const fs = require('fs'); fs.unlinkSync(req.file.path);
      } catch (error) {
        return res
          .status(400)
          .json({ error: "Failed to extract text from uploaded file." });
      }
    }

    if (!key || !title || !shortDescription) {
      return res
        .status(400)
        .json({ error: "Key, title, and short description are required." });
    }

    try {
      const newPilot = await prisma.pilotProject.create({
        data: {
          key,
          title,
          subtext,
          shortDescription,
          expandedView, // <-- This now contains the extracted text
          imageUrl,
          isActive,
          type,
        },
      });
      res.status(201).json(newPilot);
    } catch (error) {
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({ error: `Pilot project with key '${key}' already exists.` });
      }
      console.error("Admin: Failed to create pilot:", error);
      res.status(500).json({ error: "Failed to create pilot project." });
    }
  }
);

// PUT /api/admin/pilots/:pilotId (Update an existing pilot)
// --- REPLACE THE PUT /pilots/:pilotId ROUTE ---
router.put(
  "/pilots/:pilotId",
  isSuperUserOrAdmin,
  upload.single("contentFile"),
  async (req, res) => {
    const { pilotId } = req.params;
    const body = req.body;

    // Construct update data
    const dataToUpdate = {};
    if (body.title) dataToUpdate.title = body.title;
    if (body.subtext) dataToUpdate.subtext = body.subtext;
    if (body.shortDescription)
      dataToUpdate.shortDescription = body.shortDescription;
    if (body.expandedView) dataToUpdate.expandedView = body.expandedView;
    if (body.imageUrl) dataToUpdate.imageUrl = body.imageUrl;
    if (body.isActive !== undefined)
      dataToUpdate.isActive =
        body.isActive === "true" || body.isActive === true;
    if (body.type) dataToUpdate.type = body.type;

    // 1. Handle File Upload for Update
    if (req.file) {
      try {
        const fileText = await extractTextFromFile(req.file);
        // Overwrite or append? Let's overwrite if file is provided, or append if they want.
        // For simplicity: If a file is uploaded, it REPLACES the expandedView content
        // unless they also typed something in the box.
        dataToUpdate.expandedView = fileText;
      } catch (error) {
        return res
          .status(400)
          .json({ error: "Failed to extract text from uploaded file." });
      }
    }

    try {
      const updatedPilot = await prisma.pilotProject.update({
        where: { id: pilotId },
        data: dataToUpdate,
      });
      res.json(updatedPilot);
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Pilot project not found." });
      }
      console.error(`Admin: Failed to update pilot ${pilotId}:`, error);
      res.status(500).json({ error: "Failed to update pilot project." });
    }
  }
);

// DELETE /api/admin/pilots/:pilotId (Delete a pilot)
router.delete("/pilots/:pilotId", isSuperUserOrAdmin, async (req, res) => {
  const { pilotId } = req.params;
  try {
    await prisma.pilotProject.delete({
      where: { id: pilotId },
    });
    res.status(204).send(); // No content
  } catch (error) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Pilot project not found." });
    }
    console.error(`Admin: Failed to delete pilot ${pilotId}:`, error);
    res.status(500).json({ error: "Failed to delete pilot project." });
  }
});

// GET all Healing Packages
router.get("/healing-packages", isSuperUserOrAdmin, async (req, res) => {
  console.log(`User ${req.user.id} requesting /api/admin/healing-packages`);
  try {
    const packages = await prisma.healingPackage.findMany({
      orderBy: { createdAt: "asc" },
    });
    console.log(`Found ${packages.length} healing packages.`);
    res.json(packages);
  } catch (error) {
    console.error("Failed to fetch healing packages:", error);
    res.status(500).json({ error: "Failed to fetch healing packages." });
  }
});

// POST a new Healing Package
router.post("/healing-packages", isSuperUserOrAdmin, async (req, res) => {
  const { title, shortPreview, fee, duration, cta, isActive } = req.body;
  if (!title || !shortPreview || !fee || !duration || !cta) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const newPackage = await prisma.healingPackage.create({
      data: { title, shortPreview, fee, duration, cta, isActive },
    });
    res.status(201).json(newPackage);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: `A package with the title "${title}" already exists.` });
    }
    console.error("Failed to create healing package:", error);
    res.status(500).json({ error: "Failed to create healing package." });
  }
});

// PUT (Update) a Healing Package
router.put("/healing-packages/:id", isSuperUserOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, shortPreview, fee, duration, cta, isActive } = req.body;
  try {
    const updatedPackage = await prisma.healingPackage.update({
      where: { id: id },
      data: { title, shortPreview, fee, duration, cta, isActive },
    });
    res.json(updatedPackage);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found." });
    }
    console.error(`Failed to update package ${id}:`, error);
    res.status(500).json({ error: "Failed to update package." });
  }
});

// DELETE a Healing Package
router.delete("/healing-packages/:id", isSuperUserOrAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.healingPackage.delete({
      where: { id: id },
    });
    res.status(204).send(); // No content
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found." });
    }
    console.error(`Failed to delete package ${id}:`, error);
    res.status(500).json({ error: "Failed to delete package." });
  }
});

// =============================================================
// --- NEW: Healing Suggestion Management (SuperUser/Admin) ---
// =============================================================

// GET all Healing Suggestions
router.get("/healing-suggestions", isSuperUserOrAdmin, async (req, res) => {
  console.log(`User ${req.user.id} requesting /api/admin/healing-suggestions`);
  try {
    const suggestions = await prisma.healingSuggestion.findMany({
      orderBy: { createdAt: "asc" },
    });
    console.log(`Found ${suggestions.length} healing suggestions.`);
    res.json(suggestions);
  } catch (error) {
    console.error("Failed to fetch healing suggestions:", error);
    res.status(500).json({ error: "Failed to fetch healing suggestions." });
  }
});

// POST a new Healing Suggestion
router.post("/healing-suggestions", isSuperUserOrAdmin, async (req, res) => {
  const { text, isActive } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Suggestion text is required." });
  }
  try {
    const newSuggestion = await prisma.healingSuggestion.create({
      data: { text, isActive },
    });
    res.status(201).json(newSuggestion);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "This suggestion already exists." });
    }
    console.error("Failed to create suggestion:", error);
    res.status(500).json({ error: "Failed to create suggestion." });
  }
});

// PUT (Update) a Healing Suggestion
router.put("/healing-suggestions/:id", isSuperUserOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { text, isActive } = req.body;
  try {
    const updatedSuggestion = await prisma.healingSuggestion.update({
      where: { id: id },
      data: { text, isActive },
    });
    res.json(updatedSuggestion);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Suggestion not found." });
    }
    console.error(`Failed to update suggestion ${id}:`, error);
    res.status(500).json({ error: "Failed to update suggestion." });
  }
});

// DELETE a Healing Suggestion
router.delete(
  "/healing-suggestions/:id",
  isSuperUserOrAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.healingSuggestion.delete({
        where: { id: id },
      });
      res.status(204).send(); // No content
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Suggestion not found." });
      }
      console.error(`Failed to delete suggestion ${id}:`, error);
      res.status(500).json({ error: "Failed to delete suggestion." });
    }
  }
);

router.get("/clients", isSuperUserOrAdmin, async (req, res) => {
  console.log(`User ${req.user.id} requesting /api/admin/clients`);
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: "GENERAL_USER",
      },
      orderBy: {
        createdAt: "desc", // Show newest clients first
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        frequencyProfile: {
          // Include if the profile exists
          select: {
            id: true,
          },
        },
        healingSubmissions: {
          // Include count of submissions
          select: {
            id: true,
          },
        },
        // We select only non-sensitive information
      },
    });

    console.log(`Found ${clients.length} client accounts.`);
    // We can remap the data slightly for easier frontend consumption
    const clientList = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      createdAt: client.createdAt,
      hasProfile: !!client.frequencyProfile, // Simple boolean
      submissionCount: client.healingSubmissions.length,
    }));

    res.json(clientList);
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    res.status(500).json({ error: "Failed to fetch clients." });
  }
});

router.get("/clients/:id", isSuperUserOrAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const client = await prisma.user.findUnique({
      where: {
        id: id,
        role: "GENERAL_USER", // Ensure we only fetch users with the GENERAL_USER role
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        frequencyProfile: true, // Get the FULL profile object
        healingSubmissions: {
          // Get their full submission history
          orderBy: { createdAt: "desc" },
        },
        visionSubmissions: {
          // Also include their vision submissions
          orderBy: { createdAt: "desc" },
        },
        // Add any other related data you want to show on the profile
      },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }

    res.json(client);
  } catch (error) {
    console.error(`Failed to fetch client ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch client details." });
  }
});

/**
 * GET /api/admin/documents/:documentId/download
 * Retrieves a physical file from server storage, protected by admin authentication.
 */
router.get(
  "/documents/:documentId/download",
  isSuperUserOrAdmin,
  async (req, res) => {
    const { documentId } = req.params;

    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found." });
      }

      // Use the full path stored in the database
      const filePath = document.filePath;

      // Safety check: Ensure the file exists before attempting to send
      if (fs.existsSync(filePath)) {
        // res.download sets the correct Content-Type and Content-Disposition headers
        res.download(filePath, document.originalName, (err) => {
          if (err) {
            console.error(`Error sending file ${documentId}:`, err);
            res
              .status(500)
              .json({ error: "Could not download file due to server error." });
          }
        });
      } else {
        console.error(
          `Physical file not found for Document ID ${documentId}: ${filePath}`
        );
        res.status(404).json({ error: "File not found on server storage." });
      }
    } catch (error) {
      console.error("Failed to process document download:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// =============================================================
// --- Infrastructure Submission Routes ---
// =============================================================

/**
 * GET /api/admin/infrastructure-submissions
 * Retrieves a list of all Infrastructure submissions with file metadata.
 */
router.get(
  "/infrastructure-submissions",
  isSuperUserOrAdmin,
  async (req, res) => {
    try {
      const submissions = await prisma.infrastructureSubmission.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          // Include the document metadata so we can show if a file exists in the list
          document: {
            select: {
              id: true,
              originalName: true,
              fileSize: true,
              mimeType: true,
            },
          },
          // Include the linked task to show status
          task: {
            select: { id: true, title: true, status: true },
          },
        },
      });
      res.json(submissions);
    } catch (error) {
      console.error("Failed to fetch infrastructure submissions list:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch infrastructure submissions list." });
    }
  }
);

/**
 * GET /api/admin/infrastructure-submissions/:id
 * Retrieves a single Infrastructure submission's full details.
 */
router.get(
  "/infrastructure-submissions/:id",
  isSuperUserOrAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const submission = await prisma.infrastructureSubmission.findUnique({
        where: { id },
        include: {
          document: true, // Get full document details for the download button
          task: true, // Link to the task
          user: {
            // Info about the registered user (if applicable)
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!submission) {
        return res
          .status(404)
          .json({ error: "Infrastructure submission not found." });
      }

      res.json(submission);
    } catch (error) {
      console.error(
        "Failed to fetch infrastructure submission details:",
        error
      );
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// =========================================================================
// 8. INFRASTRUCTURE SUGGESTION MANAGEMENT (SUPER_USER ONLY)
// =========================================================================
router.get("/infrastructure-suggestions", async (req, res) => {
  try {
    const suggestions = await prisma.infrastructureSuggestion.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch suggestions." });
  }
});

router.post("/infrastructure-suggestions", async (req, res) => {
  const { text, isActive = true } = req.body;
  try {
    const suggestion = await prisma.infrastructureSuggestion.create({
      data: { text, isActive },
    });
    res.status(201).json(suggestion);
  } catch (e) {
    res
      .status(400)
      .json({ error: "Suggestion creation failed (Is text unique?)." });
  }
});

router.put("/infrastructure-suggestions/:id", async (req, res) => {
  const { id } = req.params;
  const { text, isActive } = req.body;
  try {
    const suggestion = await prisma.infrastructureSuggestion.update({
      where: { id },
      data: { text, isActive },
    });
    res.json(suggestion);
  } catch (e) {
    res.status(400).json({ error: "Suggestion update failed." });
  }
});

router.delete("/infrastructure-suggestions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.infrastructureSuggestion.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Suggestion deletion failed." });
  }
});

// =========================================================================
// 9. VISION SUGGESTION MANAGEMENT (SUPER_USER ONLY)
// =========================================================================
router.get("/vision-suggestions", async (req, res) => {
  try {
    const suggestions = await prisma.visionSuggestion.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch suggestions." });
  }
});

router.post("/vision-suggestions", async (req, res) => {
  const { text, isActive = true } = req.body;
  try {
    const suggestion = await prisma.visionSuggestion.create({
      data: { text, isActive },
    });
    res.status(201).json(suggestion);
  } catch (e) {
    res
      .status(400)
      .json({ error: "Suggestion creation failed (Is text unique?)." });
  }
});

router.put("/vision-suggestions/:id", async (req, res) => {
  const { id } = req.params;
  const { text, isActive } = req.body;
  try {
    const suggestion = await prisma.visionSuggestion.update({
      where: { id },
      data: { text, isActive },
    });
    res.json(suggestion);
  } catch (e) {
    res.status(400).json({ error: "Suggestion update failed." });
  }
});

router.delete("/vision-suggestions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.visionSuggestion.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Suggestion deletion failed." });
  }
});

// =========================================================================
// 9. EXTRACT TEXT FROM UPLOADED PILOT DOCUMENT (REAL IMPLEMENTATION)
router.post(
  "/pilots/extract-text",
  upload.single("contentFile"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    let extractedText = "";
    let errorOccurred = false;

    try {
      if (mimeType === "text/plain") {
        // 1. Handle Plain Text (Direct Read)
        extractedText = fs.readFileSync(filePath, "utf8");
      } else if (mimeType === "application/pdf") {
        // 2. Handle PDF (Requires 'pdf-parse')
        const dataBuffer = fs.readFileSync(filePath);

        // The function call remains the same, but the variable 'pdfParse' is now guaranteed to be the function
        const data = await pdfParse(dataBuffer);

        extractedText = data.text;
      } else if (
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // 3. Handle DOCX (Requires 'mammoth')
        const result = await mammoth.convertToMarkdown({ path: filePath });
        extractedText = result.value;
      } else {
        // Unsupported type
        extractedText = `--- ERROR: File type (${mimeType}) is not supported for automatic extraction. Please enter content manually. ---`;
        errorOccurred = true;
      }

      if (!errorOccurred) {
        extractedText =
          `# Extracted Content from ${req.file.originalname}\n\n` +
          extractedText;
      }
    } catch (e) {
      errorOccurred = true;
      console.error(`Extraction failed for ${mimeType}:`, e);
      // Provide a more helpful error message in the field
      extractedText = `--- ERROR: Failed to process file content. Reason: ${
        e.message || "Check server logs for details."
      } ---`;
    } finally {
      // Crucial: Clean up the temporary file immediately
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Send the extracted text back to the client
    res.status(200).json({
      markdownText: extractedText,
      originalName: req.file.originalname,
      success: !errorOccurred,
    });
  }
);

// server/src/api/adminRoutes.js

router.get("/pilot-engagements", async (req, res) => {
  try {
    const engagements = await prisma.pilotEngagement.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(engagements);
  } catch (error) {
    console.error("Error fetching engagements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
