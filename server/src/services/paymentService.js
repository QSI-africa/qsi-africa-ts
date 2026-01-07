// server/src/services/paymentService.js

const axios = require('axios');
const crypto = require('crypto');

const PAYNOW_API_URL = "https://www.paynow.co.zw/Interface/CheckOut.aspx"; 

// Helper function to create the required PayNow hash string
const createHash = (params, Key) => {
    // PayNow requires parameters to be ordered alphabetically and concatenated
    const keys = Object.keys(params).sort();
    let concatenatedString = '';
    
    for (const key of keys) {
        // Ensure values are strings for concatenation
        concatenatedString += params[key];
    }
    concatenatedString += Key; // Append the Integration Key last

    return crypto.createHash('sha512').update(concatenatedString).digest('hex').toUpperCase();
};

const initiatePayNowTransaction = async (invoice) => {
    const totalAmountUSD = invoice.totalAmount.toFixed(2);
    const invoiceId = invoice.id;
    const invoiceNumber = invoice.invoiceNumber;
    
    // Parameters required by PayNow
    const payNowParams = {
        'id': process.env.PAYNOW_INTEGRATION_ID,
        'reference': invoiceNumber, // Must be unique
        'amount': totalAmountUSD,
        'additionalinfo': `QSI Payment for ${invoiceNumber}`,
        'returnurl': process.env.PAYNOW_RETURN_URL,
        'resulturl': process.env.PAYNOW_RESULT_URL,
        'status': 'Message',
        'authemail': invoice.clientEmail,
        'authphone': invoice.clientPhone || 'N/A',
        'currency': 'USD', // Assuming USD based on your schema
    };

    // Generate the integrity hash
    const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
    const hash = createHash(payNowParams, integrationKey);
    
    // Prepare the final request payload
    const payload = new URLSearchParams({
        ...payNowParams,
        'hash': hash
    }).toString();

    try {
        // Post the request to PayNow
        const response = await axios.post(PAYNOW_API_URL, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // PayNow API returns a string of key=value pairs, separated by &
        const responseData = new URLSearchParams(response.data);
        
        const status = responseData.get('status');
        const browserUrl = responseData.get('browserurl');

        if (status === 'Ok' && browserUrl) {
            return { success: true, paymentUrl: browserUrl };
        } else {
            console.error("PayNow Error Response:", response.data);
            return { success: false, error: responseData.get('error') || responseData.get('message') };
        }

    } catch (error) {
        console.error("PayNow API connection failed:", error.message);
        return { success: false, error: 'Payment gateway communication failure.' };
    }
};

module.exports = {
    initiatePayNowTransaction
};