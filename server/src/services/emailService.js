// server/src/services/emailService.js
const nodemailer = require("nodemailer");

// 1. Create a "transporter" object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587, // Standard for SMTP
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Create the email function
async function sendInfraRequestEmail(submission) {
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
          <p>${submission.description}</p>
        </ul>
        <p>Please review and prepare a quotation.</p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Sends an email notification to a user when they are assigned a task.
 * @param {object} task - The task object from Prisma.
 * @param {object} assignedToUser - The user object (with email) being assigned.
 * @param {object} assignedByUser - The user object (Super User) assigning the task.
 */
async function sendTaskAssignmentEmail(task, assignedToUser, assignedByUser) {
  // Construct the link to the task detail page (adjust URL if needed)
  const taskUrl = `https://qsi.co.zw/tasks/${task.id}`; // Assuming admin runs on 5173

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
  } catch (error) {
    console.error("Error sending assignment email:", error);
    return false;
  }
}

async function sendPasswordResetEmail(user, resetToken) {
  // Construct the reset link (adjust URL for your admin frontend)
  const resetUrl = `https://qsi.co.zw/reset-password/${resetToken}`; // Assuming admin runs on 5173

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
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // In a real app, you might want more robust error handling here
    return false;
  }
}

// --- NEW: Send Healing Conversation Summary ---
/**
 * Sends the initial healing conversation details to the admin.
 * @param {object} submission - The HealingSubmission object from Prisma.
 */
async function sendHealingConversationEmail(submission) {
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
  } catch (error) {
    console.error("Error sending healing conversation email:", error);
    return false;
  }
}

/**
 * Sends a PDF quotation/invoice to the client via email.
 * @param {object} invoice - The Invoice Prisma record.
 * @param {string} clientName - The client's name.
 * @param {string} pdfPath - The local path to the generated PDF file.
 */
async function sendInvoiceEmail(invoice, clientName, pdfPath) {
  // Check if the PDF file exists before proceeding
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
  } catch (error) {
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
// --- NEW: Fleet Management Emails ---

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br/>"),
    });
    console.log("Generic email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending generic email:", error);
    return false;
  }
}

async function sendFleetDriverRegistrationEmail(user, vehicle) {
  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform" <${process.env.EMAIL_USER}>`,
      to: "kadeyaelvis@gmail.com", // Admin email
      subject: `New Fleet Driver Registration: ${user.name}`,
      html: `
        <p>A new fleet driver has registered and is awaiting approval.</p>
        <h3>Driver Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Phone:</strong> ${user.phone || 'N/A'}</li>
        </ul>
        <h3>Vehicle Details:</h3>
        <ul>
          <li><strong>Make/Model:</strong> ${vehicle.make} ${vehicle.model}</li>
          <li><strong>Year:</strong> ${vehicle.year || 'N/A'}</li>
          <li><strong>Color:</strong> ${vehicle.color || 'N/A'}</li>
          <li><strong>License Plate:</strong> ${vehicle.licensePlate}</li>
          <li><strong>Type:</strong> ${vehicle.vehicleType}</li>
          <li><strong>Capacity:</strong> ${vehicle.capacity} seats</li>
        </ul>
        <p>Please log in to the admin portal to approve or reject this registration.</p>
      `,
    });
    console.log("Fleet driver registration email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending fleet driver registration email:", error);
    return false;
  }
}

async function sendDriverApprovalEmail(user, isApproved) {
  try {
    const statusText = isApproved ? "approved" : "rejected";
    const info = await transporter.sendMail({
      from: `"QSI Platform Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `QSI Fleet Driver Registration ${isApproved ? 'Approved' : 'Rejected'}`,
      html: `
        <p>Hello ${user.name},</p>
        <p>Your registration as a QSI Fleet Driver has been <strong>${statusText}</strong>.</p>
        ${isApproved ? '<p>You can now log in to the <a href="https://admin.qsi.africa">admin portal</a> to access your fleet driver dashboard.</p>' : '<p>If you have any questions, please contact our support team.</p>'}
        <p>Thank you,<br>QSI Platform</p>
      `,
    });
    console.log("Driver approval email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending driver approval email:", error);
    return false;
  }
}

async function sendNewRideRequestEmail(client, request) {
  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform" <${process.env.EMAIL_USER}>`,
      to: "kadeyaelvis@gmail.com", // Admin email
      subject: `New Ride Request from ${client.name}`,
      html: `
        <p>A new ride request has been submitted.</p>
        <h3>Request Details:</h3>
        <ul>
          <li><strong>Client:</strong> ${client.name} (${client.email})</li>
          <li><strong>Pickup:</strong> ${request.pickupLocation}</li>
          <li><strong>Drop-off:</strong> ${request.dropoffLocation}</li>
          <li><strong>Date:</strong> ${new Date(request.rideDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${request.rideTime}</li>
          <li><strong>Offer Price:</strong> $${request.offerPrice}</li>
        </ul>
        <p>Please log in to the admin portal to process this request.</p>
      `,
    });
    console.log("New ride request email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending new ride request email:", error);
    return false;
  }
}

async function sendRideRequestBroadcastEmail(driverEmail, request) {
  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform Admin" <${process.env.EMAIL_USER}>`,
      to: driverEmail,
      subject: `New Ride Request Broadcast Available`,
      html: `
        <p>Hello,</p>
        <p>A new ride request is available in your area.</p>
        <h3>Request Details:</h3>
        <ul>
          <li><strong>Pickup:</strong> ${request.pickupLocation}</li>
          <li><strong>Drop-off:</strong> ${request.dropoffLocation}</li>
          <li><strong>Date:</strong> ${new Date(request.rideDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${request.rideTime}</li>
          <li><strong>Price:</strong> $${request.finalPrice || request.offerPrice}</li>
        </ul>
        <p>Log in to your fleet driver dashboard to accept this request.</p>
        <p>Thank you,<br>QSI Platform</p>
      `,
    });
    console.log("Ride request broadcast email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending ride request broadcast email:", error);
    return false;
  }
}

async function sendRideAssignedEmail(user, request, isDriver) {
  try {
    const subject = isDriver ? `Ride Request Assigned to You` : `Your Ride Request has been Assigned`;
    const html = isDriver ? `
        <p>Hello,</p>
        <p>You have been assigned a ride request.</p>
        <h3>Request Details:</h3>
        <ul>
          <li><strong>Client:</strong> ${request.client.name} (${request.client.phone || 'No phone'})</li>
          <li><strong>Pickup:</strong> ${request.pickupLocation}</li>
          <li><strong>Drop-off:</strong> ${request.dropoffLocation}</li>
          <li><strong>Date:</strong> ${new Date(request.rideDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${request.rideTime}</li>
          <li><strong>Price:</strong> $${request.finalPrice || request.offerPrice}</li>
        </ul>
        <p>Please check your dashboard for more details.</p>
        <p>Thank you,<br>QSI Platform</p>
    ` : `
        <p>Hello ${user.name},</p>
        <p>Your ride request has been assigned to a driver.</p>
        <h3>Driver Details:</h3>
        <ul>
          <li><strong>Driver:</strong> ${request.assignedDriver.name}</li>
          <li><strong>Vehicle:</strong> ${request.assignedDriver.fleetVehicle?.make} ${request.assignedDriver.fleetVehicle?.model} (${request.assignedDriver.fleetVehicle?.color})</li>
          <li><strong>License Plate:</strong> ${request.assignedDriver.fleetVehicle?.licensePlate}</li>
        </ul>
        <p>Thank you,<br>QSI Platform</p>
    `;
    const info = await transporter.sendMail({
      from: `"QSI Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html,
    });
    console.log("Ride assigned email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending ride assigned email:", error);
    return false;
  }
}

async function sendPriceUpdateEmail(client, request) {
  try {
    const info = await transporter.sendMail({
      from: `"QSI Platform Admin" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject: `Update on Your Ride Request Price`,
      html: `
        <p>Hello ${client.name},</p>
        <p>The price for your ride request from <strong>${request.pickupLocation}</strong> to <strong>${request.dropoffLocation}</strong> has been updated by the admin.</p>
        <p><strong>New Price:</strong> $${request.finalPrice}</p>
        ${request.adminNotes ? `<p><strong>Admin Notes:</strong> ${request.adminNotes}</p>` : ''}
        <p>You can check the updated details on your dashboard.</p>
        <p>Thank you,<br>QSI Platform</p>
      `,
    });
    console.log("Price update email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending price update email:", error);
    return false;
  }
}

async function sendRideStatusUpdateEmail(client, request, status) {
  try {
    const statusText = status === "IN_PROGRESS" ? "is now in progress" : (status === "COMPLETED" ? "has been completed" : `status changed to ${status}`);
    const info = await transporter.sendMail({
      from: `"QSI Platform" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject: `Ride Request Update: ${statusText}`,
      html: `
        <p>Hello ${client.name},</p>
        <p>Your ride request from <strong>${request.pickupLocation}</strong> to <strong>${request.dropoffLocation}</strong> ${statusText}.</p>
        <p>Thank you for using QSI Platform.</p>
      `,
    });
    console.log("Ride status update email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending ride status update email:", error);
    return false;
  }
}

module.exports = {
  sendInfraRequestEmail,
  sendTaskAssignmentEmail,
  sendPasswordResetEmail,
  sendHealingConversationEmail,
  sendInvoiceEmail,
  sendEmail,
  sendFleetDriverRegistrationEmail,
  sendDriverApprovalEmail,
  sendNewRideRequestEmail,
  sendRideRequestBroadcastEmail,
  sendRideAssignedEmail,
  sendPriceUpdateEmail,
  sendRideStatusUpdateEmail,
};
