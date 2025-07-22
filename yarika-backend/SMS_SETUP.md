# SMS Setup Guide for Yarika

This guide explains how to set up SMS notifications for order confirmations and status updates using Twilio.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. A Twilio phone number
3. Your Twilio Account SID and Auth Token

## Environment Variables

Add the following variables to your `.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Getting Your Twilio Credentials

1. **Account SID**: Found in your Twilio Console dashboard
2. **Auth Token**: Found in your Twilio Console dashboard (click "Show" to reveal)
3. **Phone Number**: Your Twilio phone number (format: +1234567890)

## SMS Features

### Order Confirmation SMS
- Sent automatically when an order is placed successfully
- Includes order ID and total amount
- Sent to the customer's phone number from their profile

### Order Status Update SMS
- Sent when admin updates order status
- Different messages for different statuses:
  - Confirmed: Order confirmed and being processed
  - Shipped: Order has been shipped
  - Delivered: Order has been delivered
  - Cancelled: Order has been cancelled

## SMS Message Examples

### Order Confirmation
```
Dear John Doe, your order #64f8a2b3c4d5e6f7 has been placed successfully! Total amount: ₹1,299.00. Thank you for choosing Yarika!
```

### Status Updates
```
Dear John Doe, your order #64f8a2b3c4d5e6f7 has been confirmed and is being processed. We'll notify you when it ships!
```

## Testing SMS

1. Ensure all environment variables are set correctly
2. Place a test order through the website
3. Check the console logs for SMS sending status
4. Verify the SMS is received on the customer's phone

## Troubleshooting

### SMS Not Sending
- Check if Twilio credentials are correct
- Verify the phone number format (should start with +91 for India)
- Check console logs for error messages
- Ensure Twilio account has sufficient credits

### Invalid Phone Number
- Phone numbers are automatically formatted to +91 format for India
- If customer doesn't have a phone number, SMS will be skipped
- Check customer profile for phone number

### SMS Service Not Initialized
- Verify all environment variables are set
- Check if Twilio package is installed: `npm install twilio`
- Restart the server after adding environment variables

## Cost Considerations

- Twilio charges per SMS sent
- Current pricing: ~₹0.50 per SMS in India
- Monitor your Twilio usage in the console
- Consider implementing SMS limits if needed

## Security Notes

- Never commit your Twilio credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate your Twilio Auth Token
- Monitor SMS usage for unusual activity

## Disabling SMS

To disable SMS notifications temporarily:
1. Remove or comment out the TWILIO environment variables
2. The system will log warnings but continue to function
3. Orders will still be created successfully

## Support

For Twilio-related issues:
- Check Twilio documentation: https://www.twilio.com/docs
- Contact Twilio support: https://www.twilio.com/help
- Check your Twilio console for error logs 

This guide explains how to set up SMS notifications for order confirmations and status updates using Twilio.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. A Twilio phone number
3. Your Twilio Account SID and Auth Token

## Environment Variables

Add the following variables to your `.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Getting Your Twilio Credentials

1. **Account SID**: Found in your Twilio Console dashboard
2. **Auth Token**: Found in your Twilio Console dashboard (click "Show" to reveal)
3. **Phone Number**: Your Twilio phone number (format: +1234567890)

## SMS Features

### Order Confirmation SMS
- Sent automatically when an order is placed successfully
- Includes order ID and total amount
- Sent to the customer's phone number from their profile

### Order Status Update SMS
- Sent when admin updates order status
- Different messages for different statuses:
  - Confirmed: Order confirmed and being processed
  - Shipped: Order has been shipped
  - Delivered: Order has been delivered
  - Cancelled: Order has been cancelled

## SMS Message Examples

### Order Confirmation
```
Dear John Doe, your order #64f8a2b3c4d5e6f7 has been placed successfully! Total amount: ₹1,299.00. Thank you for choosing Yarika!
```

### Status Updates
```
Dear John Doe, your order #64f8a2b3c4d5e6f7 has been confirmed and is being processed. We'll notify you when it ships!
```

## Testing SMS

1. Ensure all environment variables are set correctly
2. Place a test order through the website
3. Check the console logs for SMS sending status
4. Verify the SMS is received on the customer's phone

## Troubleshooting

### SMS Not Sending
- Check if Twilio credentials are correct
- Verify the phone number format (should start with +91 for India)
- Check console logs for error messages
- Ensure Twilio account has sufficient credits

### Invalid Phone Number
- Phone numbers are automatically formatted to +91 format for India
- If customer doesn't have a phone number, SMS will be skipped
- Check customer profile for phone number

### SMS Service Not Initialized
- Verify all environment variables are set
- Check if Twilio package is installed: `npm install twilio`
- Restart the server after adding environment variables

## Cost Considerations

- Twilio charges per SMS sent
- Current pricing: ~₹0.50 per SMS in India
- Monitor your Twilio usage in the console
- Consider implementing SMS limits if needed

## Security Notes

- Never commit your Twilio credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate your Twilio Auth Token
- Monitor SMS usage for unusual activity

## Disabling SMS

To disable SMS notifications temporarily:
1. Remove or comment out the TWILIO environment variables
2. The system will log warnings but continue to function
3. Orders will still be created successfully

## Support

For Twilio-related issues:
- Check Twilio documentation: https://www.twilio.com/docs
- Contact Twilio support: https://www.twilio.com/help
- Check your Twilio console for error logs 
 
 
 