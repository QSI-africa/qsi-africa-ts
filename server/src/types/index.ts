// server/src/types/index.ts

// Common request body types
export interface InfrastructureSubmission {
  id?: number;
  name: string;
  description: string;
  userId?: number;
  messages?: ChatMessage[];
  documents?: Document[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
}

export interface Document {
  id?: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  filePath: string;
  fileSize: number;
  userId?: number;
  category?: string;
  documentType?: string;
  infrastructureSubmissionId?: number;
  createdAt?: Date;
}

export interface FrequencyProfileData {
  fullName?: string;
  location: string;
  personalBeliefs: string;
  background: string;
  lifeVision: string;
  challenges: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Service types
export interface AIServiceResponse {
  response: string;
  error?: string;
}

// Email types
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: string | EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

// Invoice types
export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  total: number;
  dueDate?: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
