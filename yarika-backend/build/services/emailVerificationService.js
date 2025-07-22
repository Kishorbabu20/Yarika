const nodemailer = require('nodemailer');
const dns = require('dns').promises;

// Email validation function
const validateEmail = async (email) => {
  try {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: "Invalid email format. Please enter a valid email address."
      };
    }

    // Extract domain from email
    const domain = email.split('@')[1];
    
    // Check if domain exists and has MX records
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords.length === 0) {
        return {
          isValid: false,
          error: "Invalid email domain. Please enter a valid email address."
        };
      }
    } catch (dnsError) {
      return {
        isValid: false,
        error: "Invalid email domain. Please enter a valid email address."
      };
    }

    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.org', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
      'yopmail.com', 'temp-mail.org', 'sharklasers.com', 'getairmail.com',
      'mailnesia.com', 'maildrop.cc', 'tempr.email', 'fakeinbox.com',
      'mailmetrash.com', 'trashmail.com', 'mailnull.com', 'spam4.me',
      'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com'
    ];

    if (disposableDomains.includes(domain.toLowerCase())) {
      return {
        isValid: false,
        error: "Disposable email addresses are not allowed. Please use a valid email address."
      };
    }

    return {
      isValid: true,
      domain: domain
    };

  } catch (error) {
    console.error('Email validation error:', error);
    return {
      isValid: false,
      error: "Email validation failed. Please try again."
    };
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service not configured - missing environment variables');
      return {
        success: false,
        reason: 'Email service not configured'
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 10px;">📧 Email Verification</h1>
          <p style="color: #666; font-size: 16px;">Welcome to Yarika!</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Verify Your Email</h2>
          
          <p style="color: #666; margin: 20px 0;">
            Thank you for signing up with Yarika! To complete your registration, please use the verification code below:
          </p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #2d5a2d; margin: 0; font-size: 24px; letter-spacing: 5px;">${verificationCode}</h3>
            <p style="color: #2d5a2d; margin: 10px 0 0 0; font-size: 14px;">Verification Code</p>
          </div>
          
          <p style="color: #666; margin: 20px 0;">
            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <p style="color: #666; margin-bottom: 10px;">Thank you for choosing Yarika!</p>
          <p style="color: #666; font-size: 14px;">If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Email Verification - Yarika`,
      html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Verification email sent successfully:', {
      email: email,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Error sending verification email:', {
      email: email,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Store verification code with expiration
const storeVerificationCode = (email, code) => {
  const expiration = Date.now() + (10 * 60 * 1000); // 10 minutes
  verificationCodes.set(email, {
    code: code,
    expiration: expiration
  });
  
  // Clean up expired codes
  setTimeout(() => {
    verificationCodes.delete(email);
  }, 10 * 60 * 1000);
};

// Verify code
const verifyCode = (email, code) => {
  const stored = verificationCodes.get(email);
  if (!stored) {
    return {
      isValid: false,
      error: "Verification code not found or expired. Please request a new one."
    };
  }
  
  if (Date.now() > stored.expiration) {
    verificationCodes.delete(email);
    return {
      isValid: false,
      error: "Verification code has expired. Please request a new one."
    };
  }
  
  if (stored.code !== code) {
    return {
      isValid: false,
      error: "Invalid verification code. Please try again."
    };
  }
  
  // Remove the code after successful verification
  verificationCodes.delete(email);
  
  return {
    isValid: true
  };
};

module.exports = {
  validateEmail,
  sendVerificationEmail,
  generateVerificationCode,
  storeVerificationCode,
  verifyCode
}; 