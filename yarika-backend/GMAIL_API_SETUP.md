# Gmail API Setup Guide for Yarika Email Notifications

This guide will help you set up Gmail API for sending order confirmation and status update emails.

## Prerequisites

1. **Gmail Account**: You'll need a Gmail account
2. **Google Cloud Project**: Free Google Cloud account
3. **Backend Access**: Ability to modify environment variables

## Method 1: App Password (Recommended - Easier)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2-factor authentication

### Step 2: Generate App Password

1. Go back to **Security** → **2-Step Verification**
2. Scroll down and click **App passwords**
3. Select **Mail** as the app and **Other** as the device
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

Add to your `yarika-backend/.env` file:

```env
# Gmail Email Configuration (App Password Method)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Example:**
```env
EMAIL_USER=yarika@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Test Email Configuration

Restart your server and test with Postman:

```bash
npm run dev
```

## Method 2: Gmail API with OAuth2 (Advanced)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it "Yarika Email Service"
4. Click **Create**

### Step 2: Enable Gmail API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click on **Gmail API**
4. Click **Enable**

### Step 3: Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External
   - **App name**: Yarika Email Service
   - **User support email**: your-email@gmail.com
   - **Developer contact email**: your-email@gmail.com
4. Click **Save and Continue** through all steps
5. Back to **Create OAuth client ID**:
   - **Application type**: Web application
   - **Name**: Yarika Web Client
   - **Authorized redirect URIs**: `https://yarika.in/auth/google/callback`
6. Click **Create**
7. Download the JSON file and save it as `gmail-credentials.json`

### Step 4: Install Additional Dependencies

```bash
npm install googleapis google-auth-library
```

### Step 5: Create Gmail Service File

Create `yarika-backend/services/gmailService.js`:

```javascript
const { google } = require('googleapis');
const path = require('path');

// Load credentials
const CREDENTIALS_PATH = path.join(__dirname, '../gmail-credentials.json');
const TOKEN_PATH = path.join(__dirname, '../gmail-token.json');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Create OAuth2 client
function createOAuth2Client() {
  const credentials = require(CREDENTIALS_PATH);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

// Get and store new token
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  // You'll need to manually visit the URL and get the code
  // Then call this function with the code
}

// Send email using Gmail API
async function sendEmailWithGmailAPI(to, subject, htmlContent) {
  try {
    const oAuth2Client = createOAuth2Client();
    
    // Load existing token or get new one
    // This is a simplified version - you'll need to handle token storage
    
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    
    const message = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      htmlContent
    ].join('\n');
    
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    return {
      success: true,
      messageId: res.data.id
    };
    
  } catch (error) {
    console.error('Gmail API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendEmailWithGmailAPI
};
```

## Method 3: Using Nodemailer with Gmail (Current Implementation)

Your current implementation uses Nodemailer with Gmail SMTP, which is the simplest approach:

### Current Setup (Already Working)

```env
# Gmail SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Advantages of Current Method:
- ✅ Simple setup
- ✅ No API quotas
- ✅ Works with existing code
- ✅ Reliable delivery

## Testing Email Configuration

### Step 1: Test with Postman

Create a test order:

```
POST https://yarika.in/api/orders/add
Authorization: Bearer YOUR_USER_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "quantity": 1,
      "price": 1500,
      "size": "M",
      "color": "Red"
    }
  ],
  "totalAmount": 1500,
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phoneNumber": "9876543210"
  }
}
```

### Step 2: Check Console Logs

After creating an order, check your backend console for:

```
Order confirmation email sent successfully: { orderId: ..., messageId: ... }
```

### Step 3: Check Gmail

- Check your Gmail inbox
- Check Gmail's "Sent" folder
- Look for emails from your configured email address

## Troubleshooting

### Common Issues

#### Issue: "Email service not configured"
**Solution:**
- Check that both `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Restart your server after adding environment variables
- Verify variable names are correct

#### Issue: "Invalid login" or "Authentication failed"
**Solution:**
- Verify you're using the app password, not your regular Gmail password
- Ensure 2-factor authentication is enabled
- Check that the email address is correct

#### Issue: "Connection timeout"
**Solution:**
- Check your internet connection
- Verify Gmail SMTP settings are correct
- Try using a different network

#### Issue: "Message rejected"
**Solution:**
- Check if recipient email is valid
- Verify sender email is properly configured
- Check Gmail's sending limits

### Gmail SMTP Settings

```
Server: smtp.gmail.com
Port: 587
Security: TLS
Authentication: Required
Username: your-email@gmail.com
Password: your-app-password
```

## Email Templates

### Order Confirmation Email
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1>🎉 Order Confirmed!</h1>
  <p>Thank you for your order, {{customerName}}!</p>
  <h2>Order Details</h2>
  <p><strong>Order ID:</strong> {{orderId}}</p>
  <p><strong>Total Amount:</strong> ₹{{totalAmount}}</p>
  <!-- More order details -->
</div>
```

### Order Status Update Email
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1>📦 Order Status Update</h1>
  <p>Hello {{customerName}},</p>
  <h2>Order Update</h2>
  <p><strong>Order ID:</strong> {{orderId}}</p>
  <p><strong>New Status:</strong> {{status}}</p>
</div>
```

## Security Best Practices

### Environment Variables
- Never commit `.env` file to version control
- Use different email accounts for development and production
- Regularly rotate app passwords

### Gmail Security
- Enable 2-factor authentication
- Use app passwords instead of regular passwords
- Monitor Gmail account activity
- Set up account recovery options

## Production Considerations

### Email Limits
- Gmail: 500 emails per day (free account)
- Gmail Business: 2000 emails per day
- Consider using email service providers for high volume

### Monitoring
- Set up email delivery monitoring
- Track bounce rates and delivery failures
- Monitor spam complaints

### Backup Options
- Consider multiple email providers
- Implement email fallback mechanisms
- Use email service providers (SendGrid, Mailgun, etc.)

## Quick Setup Checklist

### App Password Method (Recommended)
- [ ] Enable 2-factor authentication on Gmail
- [ ] Generate app password
- [ ] Add environment variables to .env
- [ ] Restart backend server
- [ ] Test with Postman
- [ ] Check console logs
- [ ] Verify email delivery

### Gmail API Method (Advanced)
- [ ] Create Google Cloud project
- [ ] Enable Gmail API
- [ ] Create OAuth2 credentials
- [ ] Download credentials JSON
- [ ] Install additional dependencies
- [ ] Set up OAuth2 flow
- [ ] Test email sending

## Support Resources

- **Gmail API Documentation**: [https://developers.google.com/gmail/api](https://developers.google.com/gmail/api)
- **Nodemailer Documentation**: [https://nodemailer.com/](https://nodemailer.com/)
- **Gmail SMTP Settings**: [https://support.google.com/mail/answer/7126229](https://support.google.com/mail/answer/7126229)

Your email notifications are now ready to work with your order system! 