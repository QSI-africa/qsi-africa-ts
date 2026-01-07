// server/src/services/pdfGenerator.js

const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePdf = async (invoice, stream) => {
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF document data into the provided stream (e.g., file or response)
    doc.pipe(stream);

    // --- Header and Logo ---
    doc.image(
        'src/assets/qsi_light_logo.png', // NOTE: Replace with the actual path to your logo
        50, 45, { width: 50 }
    )
    .fillColor('#444444')
    .fontSize(10)
    .text('HYPER CIVIL ENGINEERS', 200, 50, { align: 'right' })
    .text('No. 3 Jenkinson Close, Chisipite, Harare', 200, 65, { align: 'right' })
    .text('+263 771 099 675', 200, 80, { align: 'right' })
    .moveDown();

    // --- Title ---
    const title = invoice.type === 'QUOTATION' ? 'QUOTATION' : 'INVOICE';
    doc.fontSize(18)
       .text(title, 50, 150, { align: 'left' })
       .fontSize(10)
       .moveDown();

    // --- Invoice Metadata ---
    doc.text(`Ref No: ${invoice.invoiceNumber}`, 50, 180)
       .text(`Issued Date: ${invoice.issuedDate.toLocaleDateString()}`, 50, 195)
       .text(`Due Date: ${invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'N/A'}`, 50, 210)
       .moveDown();

    // --- Client Details ---
    doc.fontSize(10)
       .text('BILL TO:', 350, 180)
       .text(invoice.clientName, 350, 195)
       .text(invoice.clientAddress || '', 350, 210)
       .text(invoice.clientEmail, 350, 225)
       .moveDown(2);

    // --- Items Table Header ---
    const tableTop = 300;
    const itemX = 50;
    const qtyX = 350;
    const priceX = 400;
    const totalX = 500;

    doc.fillColor('#000000')
       .fontSize(10)
       .text('DESCRIPTION', itemX, tableTop, { width: 250, align: 'left' })
       .text('QTY', qtyX, tableTop, { width: 50, align: 'right' })
       .text('UNIT PRICE', priceX, tableTop, { width: 50, align: 'right' })
       .text('TOTAL', totalX, tableTop, { width: 50, align: 'right' })
       .moveTo(itemX, tableTop + 15)
       .lineTo(totalX + 50, tableTop + 15)
       .stroke();

    // --- Items Table Body ---
    let y = tableTop + 30;
    invoice.items.forEach(item => {
        doc.text(item.description, itemX, y, { width: 250, align: 'left' })
           .text(item.quantity.toString(), qtyX, y, { width: 50, align: 'right' })
           .text(item.unitPrice.toFixed(2), priceX, y, { width: 50, align: 'right' })
           .text(item.total.toFixed(2), totalX, y, { width: 50, align: 'right' });
        y += 20;
    });

    // --- Summary ---
    const summaryY = y + 20;
    doc.moveTo(itemX, summaryY)
       .lineTo(totalX + 50, summaryY)
       .stroke();

    doc.fontSize(12)
       .text(`SUBTOTAL: ${invoice.currency}`, priceX, summaryY + 15, { width: 100, align: 'right' })
       .text(invoice.totalAmount.toFixed(2), totalX, summaryY + 15, { width: 50, align: 'right' })
       .text(`TOTAL DUE: ${invoice.currency}`, priceX, summaryY + 40, { width: 100, align: 'right' })
       .fillColor('#FF0000')
       .text(invoice.totalAmount.toFixed(2), totalX, summaryY + 40, { width: 50, align: 'right' });

    // --- Footer ---
    doc.fontSize(8)
       .fillColor('#444444')
       .text(invoice.notes || 'Payment terms: Due upon receipt.', 
             50, doc.page.height - 50, { align: 'left' });

    doc.end();
};

module.exports = { generatePdf };