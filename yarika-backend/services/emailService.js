const nodemailer = require('nodemailer');

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, orderId, customerName, totalAmount, items) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service not configured - missing environment variables');
      return {
        success: false,
        reason: 'Email service not configured'
      };
    }

    const transporter = createTransporter();

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 10px;">🎉 Order Confirmed!</h1>
          <p style="color: #666; font-size: 16px;">Thank you for your order, ${customerName}!</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Order Details</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">Items Ordered:</h3>
          <div style="margin: 20px 0;">
            ${items.map(item => `
              <div style="border: 1px solid #e0e0e0; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <p><strong>Product:</strong> ${item.productName || 'Product'}</p>
                <p><strong>Size:</strong> ${item.size}</p>
                <p><strong>Color:</strong> ${item.color}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> ₹${item.price}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #2d5a2d;"><strong>Status:</strong> Order Confirmed</p>
            <p style="margin: 5px 0 0 0; color: #2d5a2d;"><strong>Payment:</strong> Completed</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <p style="color: #666; margin-bottom: 10px;">We'll keep you updated on your order status.</p>
          <p style="color: #666; font-size: 14px;">Thank you for choosing Yarika!</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmed - Order #${orderId.toString().slice(-6)}`,
      html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Order confirmation email sent successfully:', {
      orderId: orderId,
      email: userEmail,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Error sending order confirmation email:', {
      orderId: orderId,
      email: userEmail,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (userEmail, orderId, status, customerName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service not configured - missing environment variables');
      return {
        success: false,
        reason: 'Email service not configured'
      };
    }

    const transporter = createTransporter();

    const statusColors = {
      'Processing': '#ffc107',
      'Shipped': '#17a2b8',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    };

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 10px;">📦 Order Status Update</h1>
          <p style="color: #666; font-size: 16px;">Hello ${customerName},</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Order Update</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Update Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="background-color: ${statusColors[status] || '#6c757d'}; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 18px; font-weight: bold;">Status: ${status}</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <p style="color: #666; margin-bottom: 10px;">We'll continue to keep you updated on your order progress.</p>
          <p style="color: #666; font-size: 14px;">Thank you for choosing Yarika!</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Status Update - ${status} - Order #${orderId.toString().slice(-6)}`,
      html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Order status update email sent successfully:', {
      orderId: orderId,
      status: status,
      email: userEmail,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Error sending order status update email:', {
      orderId: orderId,
      status: status,
      email: userEmail,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
}; 