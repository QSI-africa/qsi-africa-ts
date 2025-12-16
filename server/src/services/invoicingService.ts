import prisma from '../config/prisma';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { sendInvoiceEmail } from './emailService';

interface InvoiceItem {
    title: string;
    description?: string;
    price: number;
    isHealingPackage?: boolean;
}

interface InvoiceData {
    items: InvoiceItem[];
    totalAmount: number;
    sentToEmail: string;
    clientName: string;
    dueDate: Date;
}

// Define storage location for PDFs
const pdfDir = path.join(__dirname, '..', '..', 'invoices');
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
}

function generateInvoicePdf(invoiceNumber: string, invoiceData: InvoiceData): string {
    const filePath = path.join(pdfDir, `${invoiceNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe the document to a file
    doc.pipe(fs.createWriteStream(filePath));
    
    // --- PDF Content Generation ---
    doc.fontSize(25).text('QSI Invoice/Quotation', { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    // Sender Info
    doc.fontSize(10).text('From: PAN AFRICAN ENGINEERS', 50, 100);
    doc.text('No. 3 Jenkingson Close. Chisipite. Harare');
    doc.text('info@qsi.co.zw');
    doc.moveDown();

    // Recipient Info
    doc.text(`Bill To: ${invoiceData.clientName || 'Guest Client'}`);
    doc.text(`Email: ${invoiceData.sentToEmail}`);
    doc.text(`Invoice/Ref: ${invoiceNumber}`);
    doc.text(`Due Date: ${invoiceData.dueDate.toLocaleDateString()}`);
    doc.moveDown(2);
    
    // Items Table (Simple layout)
    const tableTop = doc.y;
    const itemX = 50;
    const priceX = 450;
    
    doc.fillColor('#444')
       .text('Description', itemX, tableTop)
       .text('Price (USD)', priceX, tableTop);
    
    doc.strokeColor('#aaa').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    let y = tableTop + 25;
    
    for (const item of invoiceData.items) {
        doc.fillColor('#000')
           .fontSize(10)
           .text(item.title, itemX, y, { width: 380 })
           .text(`$${item.price.toFixed(2)}`, priceX, y, { align: 'right' });
        y += 20;
    }
    
    doc.moveDown(1).fontSize(12).text(`TOTAL DUE: $${invoiceData.totalAmount.toFixed(2)}`, { align: 'right' });
    doc.moveDown(2).text('Thank you for choosing QSI.', { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();
    
    return filePath;
}


async function createAndSendInvoice(
    items: InvoiceItem[],
    sentToEmail: string,
    clientId: string,
    submissionType: 'infrastructure' | 'healing',
    submissionId: string,
    clientName: string
): Promise<any> {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    // 1. Create the Invoice record
    const invoiceRecord = await prisma.invoice.create({
        data: {
            // Generate a simple number, e.g., QSI-2025-001 (simplified for now)
            invoiceNumber: `QSI-${Date.now().toString().slice(-6)}`, 
            status: 'DRAFT',
            issuedDate: new Date(),
            dueDate: dueDate,
            totalAmount: totalAmount,
            sentToEmail: sentToEmail,
            clientId: clientId,
            
            referenceId: submissionId,
            referenceType: submissionType.toUpperCase(),
            clientName: clientName,
            clientEmail: sentToEmail,
            type: 'QUOTATION',
            
            // Connect PriceItems
            items: {
                create: items.map(item => ({
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    quantity: 1,
                    unitPrice: item.price,
                    total: item.price,
                    // Note: You must ensure 'isHealingPackage' is correctly set by the caller if needed
                    isHealingPackage: item.isHealingPackage || (submissionType === 'healing'), 
                }))
            }
        },
        include: { items: true, client: true }
    });

    // 2. Generate PDF
    // Pass dueDate as Date object for accurate formatting in PDF function
    const pdfPath = generateInvoicePdf(invoiceRecord.invoiceNumber, {
        items: items,
        totalAmount: totalAmount,
        sentToEmail: sentToEmail,
        clientName: clientName,
        dueDate: dueDate 
    });
    
    // 3. Update Invoice record with PDF path
    const finalInvoice = await prisma.invoice.update({
        where: { id: invoiceRecord.id },
        data: { pdfPath: pdfPath }
    });
    
    // 4. Send Email (This function will handle final PDF deletion)
    await sendInvoiceEmail(finalInvoice as any, clientName, pdfPath);

    return finalInvoice;
}

export { createAndSendInvoice, generateInvoicePdf };