# Email Quick Reference - Gmail Setup

## 🚀 Quick Setup (5 Minutes)

### Method 1: App Password (Recommended)

#### 1. Enable 2-Factor Authentication
- Go to: https://myaccount.google.com/security
- Click **2-Step Verification**
- Follow setup steps

#### 2. Generate App Password
- Go to **2-Step Verification** → **App passwords**
- Select **Mail** and **Other**
- Copy 16-character password

#### 3. Add to .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

#### 4. Restart Server
```bash
npm run dev
```

#### 5. Test with Postman
```
POST https://yarika.in/api/orders/add
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "items": [{"productId": "ID", "quantity": 1, "price": 1500, "size": "M", "color": "Red"}],
  "totalAmount": 1500,
  "shippingAddress": {"street": "123 Test", "city": "Mumbai", "state": "MH", "pincode": "400001"}
}
```

## 🔑 Important Credentials

| Credential | Format | Location |
|------------|--------|----------|
| Email User | `email@gmail.com` | Your Gmail address |
| App Password | `abcd efgh ijkl mnop` | Google Account → Security → App passwords |

## 📧 Gmail SMTP Settings

```
Server: smtp.gmail.com
Port: 587
Security: TLS
Authentication: Required
Username: your-email@gmail.com
Password: your-app-password
```

## 🧪 Testing

### Check Console Logs:
```
Order confirmation email sent successfully: { orderId: ..., messageId: ... }
```

### Check Gmail:
- Check inbox for received emails
- Check "Sent" folder for sent emails
- Look for emails from your configured address

### Test Email Function:
```javascript
const result = await sendOrderConfirmationEmail(
  'test@example.com',
  'test-order-id',
  'Test Customer',
  1000,
  [{ productName: 'Test Product', size: 'M', color: 'Red', quantity: 1, price: 1000 }]
);
console.log('Email Result:', result);
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Email service not configured" | Check .env variables and restart server |
| "Invalid login" | Use app password, not regular password |
| "Authentication failed" | Enable 2-factor authentication first |
| "Connection timeout" | Check internet and SMTP settings |
| "Message rejected" | Verify recipient email is valid |

## 📊 Email Limits

### Gmail Free Account:
- ✅ 500 emails per day
- ✅ Reliable delivery
- ✅ No API quotas
- ❌ Daily sending limits

### Gmail Business:
- ✅ 2000 emails per day
- ✅ Better deliverability
- ✅ Priority support

## 📱 Email Templates

### Order Confirmation:
```html
🎉 Order Confirmed!
Order #{{orderId}}
Amount: ₹{{amount}}
Thank you for choosing Yarika!
```

### Status Update:
```html
📦 Order Update
Order #{{orderId}}
Status: {{status}}
Track your order at yarika.com
```

## 🔒 Security Best Practices

- ✅ Enable 2-factor authentication
- ✅ Use app passwords only
- ✅ Never commit .env to git
- ✅ Monitor account activity
- ✅ Set up account recovery

## 💰 Costs

### Gmail Free:
- $0 per month
- 500 emails/day limit
- Basic features

### Gmail Business:
- $6/month per user
- 2000 emails/day limit
- Advanced features

### Email Service Providers:
- SendGrid: $15/month (40k emails)
- Mailgun: $35/month (50k emails)
- AWS SES: $0.10 per 1000 emails

## 📞 Support

- **Gmail Help**: https://support.google.com/mail
- **Nodemailer Docs**: https://nodemailer.com/
- **Gmail SMTP**: https://support.google.com/mail/answer/7126229

## ✅ Setup Checklist

- [ ] 2-factor authentication enabled
- [ ] App password generated
- [ ] .env file updated
- [ ] Server restarted
- [ ] Test order created
- [ ] Email logs checked
- [ ] Gmail inbox verified
- [ ] Sent folder checked

## 🎯 Quick Test Flow

1. **Setup**: Add email credentials to .env
2. **Restart**: `npm run dev`
3. **Login**: Get user token with Postman
4. **Create Order**: POST `/api/orders/add`
5. **Check Email**: Monitor console and Gmail
6. **Verify**: Customer receives email

## 🔧 Alternative Email Services

### SendGrid:
```env
SENDGRID_API_KEY=your-api-key
```

### Mailgun:
```env
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
```

### AWS SES:
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

Your email notifications are now ready! 🎉 