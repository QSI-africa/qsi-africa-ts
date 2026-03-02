// server/src/controllers/invoicingController.js

const prisma = require("../config/prisma");
const { getNextInvoiceNumber } = require("../utils/invoiceNumberGenerator");
const { generatePdf } = require("../services/pdfGenerator");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { initiatePayNowTransaction } = require("../services/paymentService"); // NEW IMPORT
// Configure Nodemailer Transport (Explicit SMTP for reliability)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
// Increase timeouts for slow SMTP servers
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 30000,
});

// Explicitly verify transporter connection at startup
(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP Connection: Verified and ready.");
    } catch (error) {
        console.error("❌ SMTP Connection Error:", error.message);
        console.error("Please check your EMAIL_USER and EMAIL_PASS environment variables.");
    }
})();

const generateAndSendInvoice = async (req, res) => {
  const startTime = Date.now();
  const { client, items, type, referenceId, referenceType, dueDate, notes } = req.body;

  console.log(`[Invoicing] Starting generation for ${type} - Client: ${client?.email}`);

  try {
    if (!client || !client.email || !items || items.length === 0) {
      return res.status(400).json({ error: "Client email and line items are required." });
    }

    // 1. Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = 0;
    const finalTotal = totalAmount + taxAmount;

    // 2. Get the next invoice number
    const invoiceNumber = await getNextInvoiceNumber(type);

    // 3. Create the Invoice in the database (Immediate persistence)
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber,
        type: type,
        status: "SENT",
        totalAmount: finalTotal,
        taxAmount: taxAmount,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        clientName: client.name || "Client",
        clientEmail: client.email,
        clientPhone: client.phone,
        clientAddress: client.address,
        referenceId: referenceId,
        referenceType: referenceType,
        notes: notes,
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

    // 🚀 RESPOND IMMEDIATELY TO AVOID 504 TIMEOUT
    // The background process will handle PDF generation and Email
    res.status(202).json({
      message: `${type} ${invoiceNumber} is being generated and will be sent to ${client.email}`,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      status: 'PROCESSING'
    });

    // --- BACKGROUND PROCESS START ---
    // Start processing without awaiting so the response can be sent to Nginx/Gateway
    (async () => {
      let tempFilePath = null;
      try {
        console.log(`[Invoicing:BG] Starting background tasks for ${invoiceNumber}...`);
        
        // A. Generate PayNow Link (if applicable)
        let paymentLink = null;
        if (newInvoice.type === "INVOICE") {
            const payNowResult = await initiatePayNowTransaction(newInvoice);
            if (payNowResult.success) paymentLink = payNowResult.paymentUrl;
        }

        // B. Generate the PDF
        console.log(`[Invoicing:BG] Generating PDF for ${invoiceNumber}...`);
        const pdfFileName = `${invoiceNumber}.pdf`;
        tempFilePath = path.join("/tmp", pdfFileName);
        
        await new Promise(async (resolve, reject) => {
          const stream = fs.createWriteStream(tempFilePath);
          stream.on('finish', resolve);
          stream.on('error', (err) => {
            console.error(`[Invoicing:BG] Stream Error for ${invoiceNumber}:`, err);
            reject(err);
          });
          try {
            await generatePdf(newInvoice, stream);
          } catch (err) {
            console.error(`[Invoicing:BG] PDF Gen Error for ${invoiceNumber}:`, err);
            reject(err);
          }
        });

        if (!fs.existsSync(tempFilePath)) {
          throw new Error(`PDF file not found at ${tempFilePath}`);
        }
        console.log(`[Invoicing:BG] PDF generated successfully at ${tempFilePath}`);

        // C. Send the Email
        console.log(`[Invoicing:BG] Attempting to send email to ${client.email}...`);
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: client.email,
          subject: `${type} from QSI: ${invoiceNumber}`,
          html: `
                <p>Dear ${newInvoice.clientName},</p>
                <p>Please find attached your ${newInvoice.type.toLowerCase()} (${newInvoice.invoiceNumber}).</p>
                <p>Total Amount: ${newInvoice.currency} ${parseFloat(newInvoice.totalAmount).toFixed(2)}</p>
                
                ${paymentLink ? `
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="${paymentLink}" 
                           style="background-color: #003366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Pay Now - ${newInvoice.currency} ${parseFloat(newInvoice.totalAmount).toFixed(2)}
                        </a>
                    </div>
                ` : "<p>You can find payment details in the attached PDF.</p>"}
                
                <p style="margin-top: 20px;">Thank you for your business.</p>
                <p>The QSI Team</p>
            `,
          attachments: [{ filename: pdfFileName, path: tempFilePath }],
        };

        const mailInfo = await transporter.sendMail(mailOptions);
        console.log(`[Invoicing:BG] Email sent for ${invoiceNumber}. MessageID: ${mailInfo.messageId}`);

      } catch (bgError) {
        console.error(`[Invoicing:BG] Fatal background error for ${invoiceNumber}:`, bgError);
      } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        console.log(`[Invoicing:BG] Done. Total time: ${(Date.now() - startTime) / 1000}s`);
      }
    })();
    // --- BACKGROUND PROCESS END ---

  } catch (error) {
    console.error(`[Invoicing] Initial Error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to initiate invoice generation.",
        details: error.message,
      });
    }
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

