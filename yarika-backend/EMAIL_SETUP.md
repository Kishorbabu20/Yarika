# Email Setup Guide for Yarika

This guide will help you set up email notifications for order confirmations and status updates using Gmail.

## Prerequisites

1. A Gmail account
2. Gmail App Password (not your regular password)

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

## Step 2: Generate App Password

1. Go to your Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)

## Step 3: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important Notes:**
- Use your full Gmail address for `EMAIL_USER`
- Use the 16-character app password (not your regular Gmail password)
- Remove spaces from the app password when adding to .env file

## Step 4: Test Email Configuration

You can test the email configuration by making a test order. The system will:

1. Send an order confirmation email when an order is placed
2. Send status update emails when admin changes order status

## Email Features

### Order Confirmation Email
- Sent automatically when an order is successfully placed
- Includes order details, items, and total amount
- Professional HTML formatting

### Order Status Update Email
- Sent when admin updates order status
- Includes order ID and new status
- Color-coded status indicators

## Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Check that both `EMAIL_USER` and `EMAIL_PASSWORD` are set in .env
   - Restart your server after adding environment variables

2. **"Invalid login" or "Authentication failed"**
   - Verify you're using the app password, not your regular Gmail password
   - Ensure 2-factor authentication is enabled
   - Check that the email address is correct

3. **"Connection timeout"**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

### Gmail SMTP Settings:
- Server: smtp.gmail.com
- Port: 587
- Security: TLS
- Authentication: Required

## Security Notes

- Never commit your `.env` file to version control
- Keep your app password secure
- Consider using environment-specific email accounts for production

## Alternative Email Providers

You can modify the email service to use other providers like:
- Outlook/Hotmail
- Yahoo Mail
- Custom SMTP servers

Contact your system administrator for custom SMTP configuration. 