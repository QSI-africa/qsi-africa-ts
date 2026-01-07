// server/src/middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the root upload directory (e.g., server/uploads)
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// 1. Storage Configuration: Save files to disk with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the defined uploads directory
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp-random_number.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fieldName = file.fieldname; // This will be 'documents' for multiple files
    cb(null, `${fieldName}-${uniqueSuffix}${fileExtension}`);
  },
});

// 2. File Filter: Restrict file types
const fileFilter = (req, file, cb) => {
  // Allowed file types (case insensitive)
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with a specific error message
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Please upload a PDF, DOC, DOCX, or common image format (JPEG/PNG/WebP).`
      ),
      false
    );
  }
};

// 3. Multer Configuration: Apply storage, limits, and filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit (increased from 5MB)
    files: 10, // Maximum number of files allowed
  },
  fileFilter: fileFilter,
});

// 4. Export different upload configurations for different use cases
module.exports = {
  // For single file uploads (backward compatibility)
  uploadSingle: (fieldName = "document") => upload.single(fieldName),

  // For multiple file uploads (up to 5 files)
  uploadMultiple: (fieldName = "documents", maxCount = 10) =>
    upload.array(fieldName, maxCount),

  // For mixed uploads (different fields)
  uploadFields: (fields) => upload.fields(fields),

  // For any specific configuration needed
  upload: upload,

  // Helper function to get upload directory path
  getUploadDir: () => uploadDir,

  // Helper function to clean up orphaned files
  cleanupUploadedFiles: (files) => {
    if (!files || files.length === 0) return;

    files.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          console.log(`Cleaned up orphaned file: ${file.path}`);
        } catch (err) {
          console.error(`Failed to clean up file ${file.path}:`, err);
        }
      }
    });
  },

  // Helper function to validate files before processing
  validateFiles: (files, requiredCount = 1) => {
    if (!files || files.length < requiredCount) {
      throw new Error(
        `At least ${requiredCount} file(s) required. Received: ${
          files ? files.length : 0
        }`
      );
    }

    // Additional validation if needed
    files.forEach((file) => {
      if (!file.originalname || !file.filename || !file.path) {
        throw new Error("Invalid file object received from upload");
      }
    });

    return true;
  },
};
