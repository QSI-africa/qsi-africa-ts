import nodemailer from 'nodemailer';
import fs from 'fs';

interface Submission {
  id: string;
  contactInfo: string;
  description?: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

interface HealingSubmission {
  id: string;
  contactInfo: string;
  struggleDescription: string;
  generatedPlan?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  dueDate: Date;
  sentToEmail: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendInfraRequestEmail(submission: Submission): Promise<boolean> {
  try {
    console.log("submission contact info", submission.contactInfo);
    const info = await transporter.sendMail({
      from: `"QSI Platform" <${process.env.EMAIL_USER}>`,
      to: "kadeyaelvis@gmail.com", // The admin email
      subject: `New Infrastructure Request (Ref: ${submission.id})`,
      html: `
        <p>A new infrastructure request has been submitted via the QSI Platform.</p>
        <h3>Request Details:</h3>
        <ul>
          <li><strong>Reference ID:</strong> ${submission.id}</li>
          <li><strong>Contact Info:</strong> ${submission.contactInfo}</li>
          <li><strong>Description:</strong></li>
          <p>${submission.description || 'No description provided'}</p>
        </ul>
        <p>Please review and prepare a quotation.</p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending email:", error);
    return false;
  }
}

async function sendTaskAssignmentEmail(
  task: Task,
  assignedToUser: User,
  assignedByUser: User
): Promise<boolean> {
  const taskUrl = `https://qsi.co.zw/tasks/${task.id}`;

  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform Admin" <${process.env.EMAIL_USER}>`,
      to: assignedToUser.email,
      subject: `New Task Assigned: ${task.title}`,
      html: `
        <p>Hello ${assignedToUser.name},</p>
        <p>You have been assigned a new task by ${assignedByUser.name}:</p>
        <blockquote>
          <strong>Task:</strong> ${task.title}<br>
          <strong>Status:</strong> ${task.status.replace(/_/g, " ")}
        </blockquote>
        <p>Please review the details and proceed with the required action:</p>
        <p><a href="${taskUrl}" style="padding: 10px 15px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">View Task Details</a></p>
        <p>Thank you,<br>QSI Platform</p>
      `,
    });
    console.log("Assignment email sent: %s", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending assignment email:", error);
    return false;
  }
}

async function sendPasswordResetEmail(
  user: User,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `https://qsi.co.zw/reset-password/${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "QSI Admin Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your QSI Admin account.</p>
        <p>Click the link below to set a new password. This link is valid for 1 hour.</p>
        <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you,<br>QSI Platform</p>
      `,
    });
    console.log("Password reset email sent: %s", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    // In a real app, you might want more robust error handling here
    return false;
  }
}

async function sendHealingConversationEmail(
  submission: HealingSubmission
): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform - Healing" <${process.env.EMAIL_USER}>`,
      to: "info@hypercivilengineers.com", // Admin email
      subject: `New Healing Inquiry Received (User: ${submission.contactInfo})`,
      html: `
        <p>A user initiated a Healing & Therapy session on the QSI Platform.</p>
        <h3>User Details:</h3>
        <p><strong>Contact:</strong> ${submission.contactInfo}</p>

        <h3>User's Initial Input:</h3>
        <pre style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${
          submission.struggleDescription
        }</pre>

        <h3>AI's Initial Guidance:</h3>
        <pre style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${
          submission.generatedPlan || "(No plan generated)"
        }</pre>

        <p>Please review this initial interaction. You may wish to reach out to the user directly to discuss personalized packages or further steps.</p>
        <p>Reference ID (Submission): ${submission.id}</p>
      `,
    });
    console.log("Healing conversation email sent: %s", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending healing conversation email:", error);
    return false;
  }
}

async function sendInvoiceEmail(
  invoice: Invoice,
  clientName: string,
  pdfPath: string
): Promise<void> {
  if (!fs.existsSync(pdfPath)) {
    console.error(`[EmailService] PDF file not found at path: ${pdfPath}`);
    throw new Error("Cannot send invoice; PDF file is missing.");
  }

  const isQuotation = invoice.status === "QUOTATION";
  const subject = isQuotation
    ? `Quotation #${invoice.invoiceNumber} from QSI Engineers`
    : `Invoice #${invoice.invoiceNumber} from QSI Engineers`;

  const dueDateText = isQuotation
    ? "due date"
    : `due on ${new Date(invoice.dueDate).toLocaleDateString()}`;

  const bodyText = `Dear ${clientName},

Please find attached the formal ${
    isQuotation ? "quotation" : "invoice"
  } for your submission (Ref: ${
    invoice.invoiceNumber
  }). The total amount is $${invoice.totalAmount.toFixed(2)} ${
    !isQuotation ? `, ${dueDateText}` : ""
  }.

For payment details, please refer to the attached document.

Thank you for choosing QSI.

Sincerely,
QSI Engineering Team`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"QSI Engineers" <no-reply@qsi.co.zw>',
      to: invoice.sentToEmail,
      subject: subject,
      text: bodyText,
      html: bodyText.replace(/\n/g, "<br/>"),
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          path: pdfPath, // Attach the PDF file
          contentType: "application/pdf",
        },
      ],
    });
    console.log(
      `[EmailService] Email sent for ${invoice.invoiceNumber} to ${invoice.sentToEmail}`
    );
  } catch (error: any) {
    console.error(
      `[EmailService] Error sending email for invoice ${invoice.invoiceNumber}:`,
      error
    );
    throw new Error("Failed to send invoice email.");
  } finally {
    // CLEANUP: Always delete the temporary PDF file after sending
    fs.unlink(pdfPath, (err) => {
      if (err)
        console.error(
          `[EmailService] Failed to delete temporary PDF file ${pdfPath}:`,
          err
        );
    });
  }
}
export {
  sendInfraRequestEmail,
  sendTaskAssignmentEmail,
  sendPasswordResetEmail,
  sendHealingConversationEmail,
  sendInvoiceEmail,
};
