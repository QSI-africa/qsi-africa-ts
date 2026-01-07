// server/src/utils/invoiceNumberGenerator.js

const prisma = require('../config/prisma'); // Assume Prisma is configured here

const getNextInvoiceNumber = async (type) => {
    const prefix = type === 'QUOTATION' ? 'QTE-' : 'INV-';

    // 1. Find the invoice with the highest number for this type
    const latestInvoice = await prisma.invoice.findFirst({
        where: { type },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true },
    });

    let nextNumber = 1;

    if (latestInvoice) {
        // 2. Extract the number part (e.g., 'INV-0005' -> 5)
        const numberPart = latestInvoice.invoiceNumber.split('-')[1];
        const currentNumber = parseInt(numberPart, 10);
        
        if (!isNaN(currentNumber)) {
            nextNumber = currentNumber + 1;
        }
    }

    // 3. Format with leading zeros (e.g., 5 -> '0005')
    return prefix + nextNumber.toString().padStart(4, '0');
};

module.exports = { getNextInvoiceNumber };