// server/src/api/submissionRoutes.js
const express = require("express");
const prisma = require("../config/prisma");
const {
  continueInfrastructureChat,
  continueVisionChat,
  continueHealingChat,
} = require("../services/aiService");
const {
  sendInfraRequestEmail,
  sendHealingConversationEmail,
} = require("../services/emailService");
const { upload, uploadMultiple } = require("../middleware/uploadMiddleware");
const fs = require("fs");
const router = express.Router();

// Helper: Parse JSON safely
const safeParseJSON = (data) => {
  if (!data) return [];
  if (typeof data === "object") return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Helper: Generate a fallback description if AI is empty
const generateFallbackDescription = (messages) => {
  if (!Array.isArray(messages)) return "No description provided.";
  // Extract only user messages to create a summary
  return messages
    .filter((m) => m.sender === "user")
    .map((m) => `- ${m.text}`)
    .join("\n");
};

// =========================================================================
// 1. DEDICATED UPLOAD ENDPOINT (Returns Document IDs Array)
// =========================================================================

// Use uploadMultiple middleware - IMPORTANT: Call it as a function
router.post("/upload", uploadMultiple("documents", 10), async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  try {
    const { userId, category, documentType, infrastructureSubmissionId } =
      req.body;

    // Total size validation
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 50 * 1024 * 1024;

    if (totalSize > maxTotalSize) {
      files.forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        error: `Total upload size (${(totalSize / 1024 / 1024).toFixed(
          2
        )}MB) exceeds 50MB limit.`,
      });
    }

    // Create Prisma records
    const documentPromises = files.map((file) =>
      prisma.document.create({
        data: {
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          filePath: `/uploads/${file.filename}`,
          fileSize: file.size,

          // MATCH MODEL FIELDS EXACTLY
          category: category || null,
          documentType: documentType || "GENERAL",

          uploadedAt: new Date(),

          user: userId ? { connect: { id: userId } } : undefined,

          // NOTE: The submission link for multiple documents is handled by the
          // Task link below. We are only using the 1:1 link here for the FIRST file
          // if we decide to keep the document 1:1 field on InfrastructureSubmission.
          // For now, we rely on the Task 1:Many link for all documents.
          infrastructureSubmission: infrastructureSubmissionId
            ? { connect: { id: infrastructureSubmissionId } }
            : undefined,
        },
      })
    );

    const documents = await Promise.all(documentPromises);

    res.status(201).json({
      message: `Successfully uploaded ${files.length} file(s)`,
      // 🛑 CRITICAL CHANGE: Return the array of document IDs
      documentIds: documents.map((doc) => doc.id),
      documents: documents.map((doc) => ({
        id: doc.id,
        originalName: doc.originalName,
        fileName: doc.fileName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        category: doc.category,
        documentType: doc.documentType,
      })),
      stats: {
        totalFiles: files.length,
        totalSize,
      },
    });
  } catch (error) {
    console.error("[Upload] Error:", error);

    // Cleanup files on error
    files?.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupErr) {
          console.error(
            `[Upload] Cleanup failed for ${file.path}:`,
            cleanupErr
          );
        }
      }
    });

    res.status(500).json({
      error: "File upload failed.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// =========================================================================
// 2. INFRASTRUCTURE CHAT (Now accepts documentIds Array)
// =========================================================================
router.post("/infrastructure", upload.none(), async (req, res) => {
  // 🛑 CRITICAL CHANGE: Accept documentIds (array of strings)
  let { contactInfo, userId, messages, documentIds } = req.body;

  messages = safeParseJSON(messages);
  contactInfo = safeParseJSON(contactInfo);

  // Parse documentIds if they are sent as a JSON string (common in multipart/form-data)
  if (typeof documentIds === "string") {
    try {
      documentIds = JSON.parse(documentIds);
    } catch (e) {
      documentIds = [];
    }
  } else if (!Array.isArray(documentIds)) {
    documentIds = [];
  }

  if (!messages || !contactInfo) {
    return res.status(400).json({ error: "Missing messages or contact info." });
  }

  try {
    // 1. Run AI Logic
    const aiResponse = await continueInfrastructureChat(messages, contactInfo);

    // 2. Check for Submission Tool Call
    if (aiResponse.type === "tool_call") {
      const { name, arguments: argsString } = aiResponse.toolCall.function;

      if (name === "submit_infrastructure_request") {
        let args = {};
        try {
          args = JSON.parse(argsString);
        } catch (e) {}

        // Robust Description Logic
        let finalDescription = "";
        if (args.scope_details && args.scope_details.length > 10) {
          finalDescription = `PROJECT TYPE: ${args.project_type}\nLOCATION: ${args.location}\n\nSCOPE:\n${args.scope_details}`;
        } else {
          const summary = generateFallbackDescription(messages);
          finalDescription = `PROJECT TYPE: ${
            args.project_type || "General"
          }\nLOCATION: ${
            args.location || "Not specified"
          }\n\nCONVERSATION LOG:\n${summary}`;
        }

        // --- PREPARING DOCUMENT CONNECTION ---
        const docConnect =
          documentIds && documentIds.length > 0
            ? documentIds.map((id) => ({ id })) // Format for Prisma { connect: [{ id: 'x' }, { id: 'y' }] }
            : undefined;

        console.log(
          `[Submission] Creating submission with ${
            docConnect ? docConnect.length : 0
          } document(s).`
        );

        // Use the first document for the InfrastructureSubmission's 1:1 field, if it exists
        const singleDocConnect =
          docConnect && docConnect.length > 0
            ? { connect: docConnect[0] }
            : undefined;

        // Create Submission (using the 1:1 link for the primary document)
        const submission = await prisma.infrastructureSubmission.create({
          data: {
            userId: userId || null,
            contactInfo: `${contactInfo.name} <${contactInfo.email}>`,
            conversationHistory: messages,
            document: singleDocConnect,
          },
        });

        // Create Task
        await prisma.task.create({
          data: {
            title: `New Quote - ${args.project_type || "Infrastructure"}`,
            description: finalDescription,
            status: "PENDING_ASSIGNMENT",
            submissionId: submission.id,
            // taskDocuments: docConnect ? { connect: docConnect } : undefined,
            documents: docConnect ? { connect: docConnect } : undefined,
          },
        });

        sendInfraRequestEmail(submission).catch(console.error);

        res.status(201).json({
          sender: "ai",
          text: `Request received (Ref: ${
            submission.id
          }). We have your details and ${
            docConnect ? docConnect.length : 0
          } document(s).`,
        });
      } else {
        res.status(500).json({ sender: "ai", text: "Unknown tool call." });
      }
    } else {
      // Normal Chat Response
      res.status(201).json({ sender: "ai", text: aiResponse.text });
    }
  } catch (error) {
    console.error("Infrastructure Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================================================
// 2. Endpoint for Healing Chat
// =========================================================================
router.post("/healing-chat", async (req, res) => {
  const { messages, contactInfo } = req.body;

  if (!messages || !contactInfo) {
    return res
      .status(400)
      .json({ error: "Message history and contact info are required." });
  }

  try {
    const allPackages = await prisma.healingPackage.findMany({
      where: { isActive: true },
    });

    const aiResponse = await continueHealingChat(
      messages,
      allPackages,
      contactInfo
    );

    res.status(200).json({ sender: "ai", text: aiResponse.text });
  } catch (error) {
    console.error("Failed to process healing chat:", error);
    res
      .status(500)
      .json({ sender: "ai", text: "Sorry, I encountered an error." });
  }
});

// =========================================================================
// 3. Endpoint for Healing Quote Inquiry (Direct)
// =========================================================================
router.post("/healing", async (req, res) => {
  const { struggleDescription, contactInfo, packageName, userId } = req.body;
  console.log("Received healing inquiry:", { packageName, userId });

  if (!contactInfo) {
    return res
      .status(400)
      .json({ error: "Description and contact info are required." });
  }

  try {
    const submissionData = {
      struggleDescription: `Package Inquiry: ${
        packageName || "General"
      }\n\nUser Description:\n${struggleDescription}`,
      contactInfo: contactInfo,
      generatedPlan: null,
    };
    if (userId) {
      submissionData.userId = userId;
    }

    const submission = await prisma.healingSubmission.create({
      data: submissionData,
    });

    sendHealingConversationEmail(submission).catch((err) =>
      console.error("Silent email send error:", err)
    );

    const aiResponseText =
      "Thank you for your inquiry. Our team has received your details and will contact you shortly with a personalized quote and next steps.";
    res.status(201).json({ sender: "ai", text: aiResponseText });
  } catch (error) {
    console.error("Failed to process healing inquiry:", error);
    res.status(500).json({
      sender: "ai",
      text: "Sorry, your inquiry could not be submitted.",
    });
  }
});

// =========================================================================
// 4. Endpoint for Vision Space
// =========================================================================
router.post("/vision", async (req, res) => {
  const { messages, contactInfo } = req.body;

  if (
    !messages ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !contactInfo ||
    !contactInfo.name ||
    !contactInfo.email
  ) {
    return res.status(400).json({
      error:
        "Message history and complete contact info (name, email) are required.",
    });
  }

  try {
    const aiResponse = await continueVisionChat(messages, contactInfo);

    let responseToSend = {
      sender: "ai",
      text: aiResponse.text || aiResponse.markdown || "Processing...",
    };

    if (aiResponse.type === "final") {
      const initialUserPrompt =
        messages.find((m) => m.sender === "user")?.text ||
        "User initiated vision chat.";

      try {
        await prisma.visionSubmission.create({
          data: {
            contactInfo: `${contactInfo.name} <${contactInfo.email}>`,
            initialPrompt: initialUserPrompt,
            conversationHistory: messages,
            generatedVisionOutput: aiResponse.markdown,
          },
        });
        responseToSend.text = aiResponse.markdown;
      } catch (dbError) {
        console.error("Error saving final vision to DB:", dbError);
        res.status(500).json({
          sender: "ai",
          text: "I've generated your vision, but encountered an error saving it.",
        });
        return;
      }
    }

    res.status(201).json(responseToSend);
  } catch (error) {
    console.error("Failed to process vision submission:", error);
    res.status(500).json({
      sender: "ai",
      text: "Sorry, an unexpected internal error occurred while processing your request.",
    });
  }
});

// =========================================================================
// 5. Pilot Project Getters
// =========================================================================
router.get("/pilots", async (req, res) => {
  const { type } = req.query;
  try {
    let whereClause = { isActive: true };
    if (type === "CONCEPT" || type === "FRAMEWORK") {
      whereClause.type = type;
    }

    const pilots = await prisma.pilotProject.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        key: true,
        title: true,
        subtext: true,
        shortDescription: true,
        expandedView: true,
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

router.get("/pilots/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const pilot = await prisma.pilotProject.findUnique({
      where: { key: key },
    });

    if (!pilot || !pilot.isActive) {
      return res.status(404).json({ error: "Pilot project not found." });
    }
    res.json(pilot);
  } catch (error) {
    console.error(`Failed to fetch pilot project ${key}:`, error);
    res.status(500).json({ error: "Failed to fetch pilot project details." });
  }
});

// =========================================================================
// 6. Healing Data Getters
// =========================================================================
router.get("/healing-packages", async (req, res) => {
  try {
    const packages = await prisma.healingPackage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(packages);
  } catch (error) {
    console.error("Failed to fetch healing packages:", error);
    res.status(500).json({ error: "Failed to fetch healing packages." });
  }
});

router.get("/healing-suggestions", async (req, res) => {
  try {
    const suggestions = await prisma.healingSuggestion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(suggestions);
  } catch (error) {
    console.error("Failed to fetch healing suggestions:", error);
    res.status(500).json({ error: "Failed to fetch healing suggestions." });
  }
});

router.get("/healing-suggestions", async (req, res) => {
  try {
    const suggestions = await prisma.healingSuggestion.findMany({
      where: { isActive: true },
    });
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// --- NEW GETTERS ---
router.get("/infrastructure-suggestions", async (req, res) => {
  try {
    const suggestions = await prisma.infrastructureSuggestion.findMany({
      where: { isActive: true },
    });
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.get("/vision-suggestions", async (req, res) => {
  try {
    const suggestions = await prisma.visionSuggestion.findMany({
      where: { isActive: true },
    });
    res.json(suggestions);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.post("/pilot-engagement", async (req, res) => {
  try {
    const {
      pilotKey,
      pilotTitle,
      engagementType,
      message,
      contactName,
      contactEmail,
      contactPhone,
    } = req.body;

    // Basic Validation
    if (!pilotKey || !contactEmail || !contactName) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Create record in database
    const engagement = await prisma.pilotEngagement.create({
      data: {
        pilotKey,
        pilotTitle,
        engagementType,
        message,
        contactName,
        contactEmail,
        contactPhone,
      },
    });

    // Optional: Trigger an email notification to Admin here
    // sendPilotEngagementEmail(engagement).catch(console.error);

    res.status(201).json({
      message: "Engagement submitted successfully.",
      id: engagement.id,
    });
  } catch (error) {
    console.error("Pilot Engagement Error:", error);
    res.status(500).json({ error: "Failed to submit interest." });
  }
});

module.exports = router;
