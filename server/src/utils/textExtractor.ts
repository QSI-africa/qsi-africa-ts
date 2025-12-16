import * as pdfParseNs from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

const pdfParse = (pdfParseNs as any).default || pdfParseNs;

interface FileData {
  path: string;
  mimetype: string;
}

async function extractTextFromFile(file: FileData | null): Promise<string | null> {
  if (!file) return null;

  try {
    const filePath = file.path;
    const mimeType = file.mimetype;

    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      // For text files or others, try reading as utf-8
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    // Basic cleanup: format as simple Markdown paragraphs
    // This isn't perfect "smart" formatting but gets the content in.
    return extractedText.replace(/\n\s*\n/g, '\n\n').trim();

  } catch (error: any) {
    console.error("Text extraction failed:", error);
    throw new Error("Failed to extract text from file.");
  }
}

export { extractTextFromFile };