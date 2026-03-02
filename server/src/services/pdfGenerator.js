// server/src/services/pdfGenerator.js

const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePdf = async (invoice, stream) => {
    const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
    });

    // Color Palette
    const primaryColor = '#003366'; // Deep Blue
    const secondaryColor = '#444444';
    const accentColor = '#EEEEEE';
    const textColor = '#333333';

    // Pipe results
    doc.pipe(stream);

    // --- Header Background Accent ---
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

    // --- Logo and Company Info ---
    try {
        doc.image(
            'src/assets/qsi_light_logo.png',
            50, 35, { width: 60 }
        );
    } catch (e) {
        // Fallback if logo is missing
        doc.fillColor('#FFFFFF')
           .fontSize(20)
           .text('QSI', 50, 45);
    }

    doc.fillColor('#FFFFFF')
       .fontSize(14)
       .text('HYPER CIVIL ENGINEERS', 200, 40, { align: 'right' })
       .fontSize(9)
       .text('No. 3 Jenkinson Close, Chisipite, Harare', 200, 60, { align: 'right' })
       .text('Phone: +263 771 099 675', 200, 75, { align: 'right' })
       .text('Email: info@qsi.africa', 200, 90, { align: 'right' });

    // --- Document Title and Metadata ---
    const title = invoice.type === 'QUOTATION' ? 'QUOTATION' : 'INVOICE';
    
    doc.fillColor(primaryColor)
       .fontSize(24)
       .text(title, 50, 150)
       .moveDown(0.2);

    doc.rect(50, 185, 230, 80).fill(accentColor);
    doc.fillColor(textColor)
       .fontSize(10)
       .text(`Reference No:`, 60, 195)
       .text(invoice.invoiceNumber, 150, 195, { underline: true })
       .text(`Issued Date:`, 60, 215)
       .text(invoice.issuedDate.toLocaleDateString(), 150, 215)
       .text(`Due Date:`, 60, 235)
       .text(invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'Upon Receipt', 150, 235);

    // --- Client Details ---
    doc.fillColor(textColor)
       .fontSize(10)
       .text('BILL TO:', 350, 160, { bold: true })
       .fontSize(12)
       .text(invoice.clientName, 350, 175, { bold: true })
       .fontSize(10)
       .text(invoice.clientAddress || 'No address provided', 350, 195, { width: 200 })
       .text(invoice.clientEmail, 350, 230, { color: primaryColor });

    // --- Table Header ---
    const tableTop = 300;
    const itemX = 50;
    const qtyX = 350;
    const priceX = 420;
    const totalX = 500;

    doc.rect(itemX, tableTop, 500, 25).fill(primaryColor);
    doc.fillColor('#FFFFFF')
       .fontSize(10)
       .text('DESCRIPTION', itemX + 10, tableTop + 8)
       .text('QTY', qtyX, tableTop + 8, { width: 40, align: 'center' })
       .text('PRICE', priceX, tableTop + 8, { width: 60, align: 'right' })
       .text('TOTAL', totalX, tableTop + 8, { width: 50, align: 'right' });

    // --- Table Body ---
    let y = tableTop + 25;
    let i = 0;

    invoice.items.forEach(item => {
        const rowHeight = 25;
        // Zebra striping
        if (i % 2 === 1) {
            doc.rect(itemX, y, 500, rowHeight).fill('#F9F9F9');
        }
        
        doc.fillColor(textColor)
           .text(item.description, itemX + 10, y + 8, { width: 280 })
           .text(item.quantity.toString(), qtyX, y + 8, { width: 40, align: 'center' })
           .text(parseFloat(item.unitPrice).toFixed(2), priceX, y + 8, { width: 60, align: 'right' })
           .text(parseFloat(item.total).toFixed(2), totalX, y + 8, { width: 50, align: 'right' });
        
        y += rowHeight;
        i++;
    });

    // --- Totals Section ---
    y += 20;
    const summaryWidth = 150;
    const summaryX = totalX + 50 - summaryWidth;

    doc.fillColor(textColor)
       .fontSize(10)
       .text('Subtotal:', summaryX, y)
       .text(`${invoice.currency} ${parseFloat(invoice.totalAmount).toFixed(2)}`, totalX - 20, y, { width: 70, align: 'right' });

    y += 20;
    doc.rect(summaryX, y, summaryWidth, 30).fill(primaryColor);
    doc.fillColor('#FFFFFF')
       .fontSize(12)
       .text('TOTAL DUE:', summaryX + 10, y + 10)
       .text(`${parseFloat(invoice.totalAmount).toFixed(2)}`, totalX - 20, y + 10, { width: 70, align: 'right' });

    // --- Notes & Footer ---
    if (invoice.notes) {
        doc.fillColor(textColor)
           .fontSize(10)
           .text('Notes / Terms:', 50, y + 60, { bold: true })
           .fontSize(9)
           .text(invoice.notes, 50, y + 75, { width: 300 });
    }

    doc.fontSize(8)
       .fillColor(secondaryColor)
       .text('Thank you for choosing Hyper Civil Engineers.', 50, doc.page.height - 70, { align: 'center', width: 500 })
       .text('Banking Details: Stanbic Bank | Branch: Chisipite | Account: 914000XXXXXXX', 50, doc.page.height - 55, { align: 'center', width: 500 });

    doc.end();
};

module.exports = { generatePdf };