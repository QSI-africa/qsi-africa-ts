// server/src/controllers/invoicingController.js

const prisma = require("../config/prisma");
const { getNextInvoiceNumber } = require("../utils/invoiceNumberGenerator");
const { generatePdf } = require("../services/pdfGenerator");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { initiatePayNowTransaction } = require("../services/paymentService"); // NEW IMPORT
// Configure Nodemailer Transport (Use your actual settings or secrets)
const transporter = nodemailer.createTransport({
  service: "gmail", // Or use SMTP settings for DigitalOcean/SendGrid/etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateAndSendInvoice = async (req, res) => {
  try {
    const { client, items, type, referenceId, referenceType, dueDate, notes } =
      req.body;

    if (!client || !client.email || !items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Client email and line items are required." });
    }

    // 1. Calculate totals
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = 0; // Simplified for now
    const finalTotal = totalAmount + taxAmount;

    // 2. Get the next invoice number
    const invoiceNumber = await getNextInvoiceNumber(type);

    // 3. Create the Invoice in the database
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber,
        type: type, // 'QUOTATION' or 'INVOICE'
        status: "SENT",
        totalAmount: finalTotal,
        taxAmount: taxAmount,
        dueDate: dueDate
          ? new Date(dueDate)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days

        // Client snapshot
        clientName: client.name || "Client",
        clientEmail: client.email,
        clientPhone: client.phone,
        clientAddress: client.address,

        // Generic linking (for dashboard filtering)
        referenceId: referenceId,
        referenceType: referenceType,

        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    let paymentLink = null;
    if (newInvoice.type === "INVOICE") {
      const payNowResult = await initiatePayNowTransaction(newInvoice);
      if (payNowResult.success) {
        paymentLink = payNowResult.paymentUrl;
      } else {
        // IMPORTANT: If link generation fails, log and proceed with only the PDF
        console.error("Failed to generate PayNow link:", payNowResult.error);
        // Optionally update invoice status to DRAFT if payment is mandatory
      }
    }

    // 4. Generate the PDF (using a temporary file)
    const pdfFileName = `${invoiceNumber}.pdf`;
    const tempFilePath = path.join("/tmp", pdfFileName); // Use /tmp for Docker safety
    const stream = fs.createWriteStream(tempFilePath);

    await generatePdf(newInvoice, stream);

    // 5. Send the Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `${type} from QSI: ${invoiceNumber}`,
      html: `
                <p>Dear ${newInvoice.clientName},</p>
                <p>Please find attached your ${newInvoice.type.toLowerCase()} (${
        newInvoice.invoiceNumber
      }).</p>
                <p>Total Amount: ${
                  newInvoice.currency
                } ${newInvoice.totalAmount.toFixed(2)}</p>
                
                ${
                  paymentLink
                    ? `
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="${paymentLink}" 
                           style="background-color: #5cb85c; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px;">
                            Pay Now - ${
                              newInvoice.currency
                            } ${newInvoice.totalAmount.toFixed(2)}
                        </a>
                    </div>
                `
                    : "<p>Payment link could not be generated. Please use the bank transfer details in the attached PDF.</p>"
                }
                
                <p style="margin-top: 20px;">Thank you for your business.</p>
                <p>The QSI Team</p>
            `,
      attachments: [
        {
          filename: pdfFileName,
          path: tempFilePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // 6. Clean up temporary file
    fs.unlinkSync(tempFilePath);

    res.status(200).json({
      message: `${type} ${invoiceNumber} successfully generated and sent to ${client.email}`,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error(`Invoicing Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to generate and send invoice.",
      details: error.message,
    });
  }
};

// --- NEW: Download Invoice Controller ---
const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the invoice data from the database
    const invoice = await prisma.invoice.findUnique({
      where: { id: id },
      include: { items: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    const pdfFileName = `${invoice.invoiceNumber}-${invoice.clientName.replace(
      /\s/g,
      "_"
    )}.pdf`;

    // 2. Set headers to force download (Crucial for the browser)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName}"`
    );

    // 3. Generate the PDF directly into the response stream
    // The generatePdf service must be compatible with piping to the response stream
    await generatePdf(invoice, res);
  } catch (error) {
    console.error(`Download Error: ${error.message}`);
    res
      .status(500)
      .json({ error: "Failed to download invoice.", details: error.message });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// Creates a Draft or Sent invoice (without sending email unless specified - future todo)
const createInvoice = async (req, res) => {
  try {
    const { client, items, type, referenceId, referenceType, dueDate, status, notes } = req.body;
    
    // Basic Validation
    if (!client || !client.email || !items || items.length === 0) {
      return res.status(400).json({ error: "Client email and items are required." });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = 0; 
    const finalTotal = totalAmount + taxAmount;
    const invoiceNumber = await getNextInvoiceNumber(type || 'INVOICE');

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type: type || 'INVOICE',
        status: status || 'DRAFT',
        totalAmount: finalTotal,
        taxAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        clientAddress: client.address,
        referenceId,
        referenceType,
        notes,
        items: {
            create: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
            }))
        }
      },
      include: { items: true }
    });
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, items, status, dueDate, notes } = req.body;
    
    // We need to handle item updates carefully (delete all and recreate, or update individually)
    // For simplicity: Transaction to delete existing items and create new ones if items are provided.
    
    const dataToUpdate = {
        updatedAt: new Date(),
    };
    if (status) dataToUpdate.status = status;
    if (dueDate) dataToUpdate.dueDate = new Date(dueDate);
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (client) {
        if (client.name) dataToUpdate.clientName = client.name;
        if (client.email) dataToUpdate.clientEmail = client.email;
        if (client.phone) dataToUpdate.clientPhone = client.phone;
        if (client.address) dataToUpdate.clientAddress = client.address;
    }

    // Recalculate totals if items changed
    if (items) {
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        dataToUpdate.totalAmount = totalAmount; // Tax = 0 assumed
        dataToUpdate.items = {
            deleteMany: {},
            create: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
            }))
        };
    }

    const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: dataToUpdate,
        include: { items: true }
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.error("Update Invoice Error:", error);
    res.status(500).json({ error: "Failed to update invoice" });
  }
};

const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.invoice.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete invoice" });
    }
};

module.exports = {
  generateAndSendInvoice,
  downloadInvoice,
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};

