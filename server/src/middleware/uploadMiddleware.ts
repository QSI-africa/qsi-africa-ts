// server/src/middleware/uploadMiddleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Define the root upload directory (e.g., server/uploads)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// 1. Storage Configuration: Save files to disk with unique names
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Use the defined uploads directory
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Create a unique filename: fieldname-timestamp-random_number.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fieldName = file.fieldname; // This will be 'documents' for multiple files
    cb(null, `${fieldName}-${uniqueSuffix}${fileExtension}`);
  },
});

// 2. File Filter: Restrict file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types (case insensitive)
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with a specific error message
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Please upload a PDF, DOC, DOCX, or common image format (JPEG/PNG/WebP).`
      )
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
export const uploadSingle = (fieldName: string = 'document') => upload.single(fieldName);

export const uploadMultiple = (fieldName: string = 'documents', maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

export { upload };

export const getUploadDir = (): string => uploadDir;

export const cleanupUploadedFiles = (files: Express.Multer.File[]): void => {
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
};

export const validateFiles = (files: Express.Multer.File[], requiredCount: number = 1): boolean => {
  if (!files || files.length < requiredCount) {
    throw new Error(
      `At least ${requiredCount} file(s) required. Received: ${files ? files.length : 0}`
    );
  }

  // Additional validation if needed
  files.forEach((file) => {
    if (!file.originalname || !file.filename || !file.path) {
      throw new Error('Invalid file object received from upload');
    }
  });

  return true;
};
