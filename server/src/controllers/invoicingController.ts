import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { getNextInvoiceNumber } from '../utils/invoiceNumberGenerator';
import { generatePdf } from '../services/pdfGenerator';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { initiatePayNowTransaction } from '../services/paymentService';

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

interface Client {
    name?: string;
    email: string;
    phone?: string;
    address?: string;
}

interface GenerateInvoiceRequest extends Request {
    body: {
        client: Client;
        items: InvoiceItem[];
        type: 'QUOTATION' | 'INVOICE';
        referenceId?: string;
        referenceType?: string;
        dueDate?: string;
        notes?: string;
    };
}

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use SMTP settings for DigitalOcean/SendGrid/etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateAndSendInvoice = async (req: GenerateInvoiceRequest, res: Response) => {
  try {
    const { client, items, type, referenceId, referenceType, dueDate, notes } = req.body;

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
        sentToEmail: client.email,
        clientPhone: client.phone || null,
        clientAddress: client.address || null,

        // Generic linking (for dashboard filtering)
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        notes: notes || null,

        items: {
          create: items.map((item) => ({
            title: item.description, // Use description as title
            description: item.description,
            price: item.unitPrice * item.quantity,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            isHealingPackage: false,
          })),
        },
      },
      include: { items: true },
    });

    let paymentLink = null;
    if (newInvoice.type === "INVOICE") {
      const payNowResult = await initiatePayNowTransaction(newInvoice as any);
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

    await generatePdf(newInvoice as any, stream);

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
  } catch (error: any) {
    console.error(`Invoicing Error: ${error.message}`);
    res.status(500).json({
      error: "Failed to generate and send invoice.",
      details: error.message,
    });
  }
};

const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Fetch the invoice data from the database
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
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
    await generatePdf(invoice as any, res);
  } catch (error: any) {
    console.error(`Download Error: ${error.message}`);
    res
      .status(500)
      .json({ error: "Failed to download invoice.", details: error.message });
  }
};

export { generateAndSendInvoice, downloadInvoice };
