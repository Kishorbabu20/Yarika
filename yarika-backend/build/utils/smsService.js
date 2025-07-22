const twilio = require('twilio');

// Initialize Twilio client
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS service initialized successfully');
  } else {
    console.warn('Twilio credentials not found. SMS service will be disabled.');
    console.warn('To enable SMS, add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your .env file');
  }
} catch (error) {
  console.error('Failed to initialize Twilio SMS service:', error);
}

/**
 * Send SMS notification for order confirmation
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} orderId - Order ID
 * @param {string} customerName - Customer's name
 * @param {number} totalAmount - Order total amount
 */
const sendOrderConfirmationSMS = async (phoneNumber, orderId, customerName, totalAmount) => {
  try {
    if (!twilioClient) {
      console.log('SMS service not available - skipping SMS notification');
      return { success: false, reason: 'SMS service not configured' };
    }

    if (!phoneNumber) {
      console.log('No phone number provided - skipping SMS notification');
      return { success: false, reason: 'No phone number provided' };
    }

    // Format phone number (ensure it starts with +91 for India)
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+91' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    // Create SMS message
    const message = `Dear ${customerName || 'Customer'}, your order #${orderId} has been placed successfully! Total amount: ₹${totalAmount.toFixed(2)}. Thank you for choosing Yarika!`;

    console.log('Sending SMS to:', formattedPhone);
    console.log('SMS message:', message);

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // Your Twilio phone number
      to: formattedPhone
    });

    console.log('SMS sent successfully:', {
      sid: result.sid,
      status: result.status,
      to: result.to
    });

    return { 
      success: true, 
      sid: result.sid,
      status: result.status 
    };

  } catch (error) {
    console.error('SMS sending failed:', {
      error: error.message,
      code: error.code,
      phoneNumber: phoneNumber,
      orderId: orderId
    });

    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

/**
 * Send SMS notification for order status updates
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @param {string} customerName - Customer's name
 */
const sendOrderStatusUpdateSMS = async (phoneNumber, orderId, status, customerName) => {
  try {
    if (!twilioClient) {
      console.log('SMS service not available - skipping SMS notification');
      return { success: false, reason: 'SMS service not configured' };
    }

    if (!phoneNumber) {
      console.log('No phone number provided - skipping SMS notification');
      return { success: false, reason: 'No phone number provided' };
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+91' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    // Create status-specific messages
    const statusMessages = {
      'Confirmed': `Dear ${customerName || 'Customer'}, your order #${orderId} has been confirmed and is being processed. We'll notify you when it ships!`,
      'Shipped': `Dear ${customerName || 'Customer'}, your order #${orderId} has been shipped! Track your package for delivery updates.`,
      'Delivered': `Dear ${customerName || 'Customer'}, your order #${orderId} has been delivered! Thank you for shopping with Yarika.`,
      'Cancelled': `Dear ${customerName || 'Customer'}, your order #${orderId} has been cancelled. If you have any questions, please contact us.`
    };

    const message = statusMessages[status] || `Dear ${customerName || 'Customer'}, your order #${orderId} status has been updated to: ${status}`;

    console.log('Sending status update SMS to:', formattedPhone);
    console.log('SMS message:', message);

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: formattedPhone
    });

    console.log('Status update SMS sent successfully:', {
      sid: result.sid,
      status: result.status,
      to: result.to
    });

    return { 
      success: true, 
      sid: result.sid,
      status: result.status 
    };

  } catch (error) {
    console.error('Status update SMS sending failed:', {
      error: error.message,
      code: error.code,
      phoneNumber: phoneNumber,
      orderId: orderId
    });

    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

module.exports = {
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS
}; 