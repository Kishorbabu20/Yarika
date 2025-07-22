# Email Verification Testing Guide

This guide will help you test the complete email verification system for user registration and login.

## Overview

The email verification system includes:
- ✅ Email format and domain validation
- ✅ Disposable email detection
- ✅ Verification code generation and sending
- ✅ Email verification with code
- ✅ Resend verification functionality
- ✅ Login restriction for unverified emails

## Prerequisites

1. **Backend Server Running**: `npm run dev`
2. **Email Service Configured**: Gmail credentials in environment variables
3. **Postman Installed**: For testing endpoints

## Environment Variables Required

```env
# Gmail Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## Testing Flow

### 1. Test Email Validation

#### Test Valid Email
```
POST https://yarika.in/api/client/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "testuser@gmail.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phoneNumber": "9876543210"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client": {
    "id": "user_id_here",
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@gmail.com",
    "phoneNumber": "9876543210",
    "emailVerified": false
  },
  "message": "Account created successfully! Please check your email for verification code.",
  "requiresVerification": true
}
```

#### Test Invalid Email Format
```
POST https://yarika.in/api/client/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "invalid-email",
  "password": "password123",
  "confirmPassword": "password123",
  "phoneNumber": "9876543210"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid email format. Please enter a valid email address."
}
```

#### Test Disposable Email
```
POST https://yarika.in/api/client/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@tempmail.org",
  "password": "password123",
  "confirmPassword": "password123",
  "phoneNumber": "9876543210"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Disposable email addresses are not allowed. Please use a valid email address."
}
```

#### Test Invalid Domain
```
POST https://yarika.in/api/client/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@nonexistentdomain12345.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phoneNumber": "9876543210"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid email domain. Please enter a valid email address."
}
```

### 2. Test Email Verification

#### Step 1: Register User
```
POST https://yarika.in/api/client/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "your-real-email@gmail.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phoneNumber": "9876543210"
}
```

#### Step 2: Check Email for Verification Code
- Check your Gmail inbox
- Look for email from your configured EMAIL_USER
- Subject: "Email Verification - Yarika"
- Copy the 6-digit verification code

#### Step 3: Verify Email
```
POST https://yarika.in/api/client/verify-email
Content-Type: application/json

{
  "email": "your-real-email@gmail.com",
  "verificationCode": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "client": {
    "id": "user_id_here",
    "firstName": "Test",
    "lastName": "User",
    "email": "your-real-email@gmail.com",
    "phoneNumber": "9876543210",
    "emailVerified": true
  }
}
```

### 3. Test Login with Email Verification

#### Test Login Before Verification
```
POST https://yarika.in/api/client/login
Content-Type: application/json

{
  "email": "your-real-email@gmail.com",
  "password": "password123"
}
```

**Expected Response (Before Verification):**
```json
{
  "success": false,
  "error": "Please verify your email address before logging in. Check your inbox for verification code.",
  "requiresVerification": true,
  "email": "your-real-email@gmail.com"
}
```

#### Test Login After Verification
```
POST https://yarika.in/api/client/login
Content-Type: application/json

{
  "email": "your-real-email@gmail.com",
  "password": "password123"
}
```

**Expected Response (After Verification):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client": {
    "id": "user_id_here",
    "firstName": "Test",
    "lastName": "User",
    "email": "your-real-email@gmail.com",
    "phoneNumber": "9876543210",
    "emailVerified": true
  }
}
```

### 4. Test Resend Verification

#### Resend Verification Email
```
POST https://yarika.in/api/client/resend-verification
Content-Type: application/json

{
  "email": "your-real-email@gmail.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully! Please check your inbox."
}
```

### 5. Test Error Cases

#### Test Invalid Verification Code
```
POST https://yarika.in/api/client/verify-email
Content-Type: application/json

{
  "email": "your-real-email@gmail.com",
  "verificationCode": "000000"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid verification code. Please try again."
}
```

#### Test Expired Verification Code
- Wait 10 minutes after registration
- Try to verify with the old code

**Expected Response:**
```json
{
  "success": false,
  "error": "Verification code has expired. Please request a new one."
}
```

#### Test Already Verified Email
```
POST https://yarika.in/api/client/verify-email
Content-Type: application/json

{
  "email": "your-real-email@gmail.com",
  "verificationCode": "123456"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Email is already verified"
}
```

### 6. Test User Profile

#### Get User Profile
```
GET https://yarika.in/api/client/me
Authorization: Bearer YOUR_TOKEN
```

**Expected Response:**
```json
{
  "id": "user_id_here",
  "firstName": "Test",
  "lastName": "User",
  "email": "your-real-email@gmail.com",
  "phoneNumber": "9876543210",
  "emailVerified": true,
  "addresses": []
}
```

## Console Logs to Monitor

### Registration Process:
```
=== REGISTRATION ATTEMPT ===
Request body: { firstName: 'Test', lastName: 'User', email: 'test@gmail.com', ... }
Validating email: test@gmail.com
Email validation passed for domain: gmail.com
Creating new client...
Sending verification email...
Client created successfully, generating token...
Token generated successfully
```

### Email Sending:
```
Verification email sent successfully: { email: 'test@gmail.com', messageId: '...' }
```

### Login Process:
```
=== LOGIN ATTEMPT ===
Looking for client with email: test@gmail.com
Client found, checking password...
Password matched, checking email verification...
Login failed: Email not verified
```

## Email Templates

### Verification Email Content:
```html
📧 Email Verification
Welcome to Yarika!

Verify Your Email
Thank you for signing up with Yarika! To complete your registration, please use the verification code below:

[123456] (Verification Code)

This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.

Thank you for choosing Yarika!
```

## Testing Checklist

### Email Validation:
- [ ] Valid email format passes
- [ ] Invalid email format fails
- [ ] Disposable email domains blocked
- [ ] Invalid domains blocked
- [ ] Real domains pass validation

### Registration:
- [ ] User registration creates account
- [ ] Verification code generated
- [ ] Verification email sent
- [ ] User marked as unverified
- [ ] Response includes verification message

### Email Verification:
- [ ] Valid code verifies email
- [ ] Invalid code fails
- [ ] Expired code fails
- [ ] Already verified email handled
- [ ] User marked as verified after success

### Login:
- [ ] Unverified user cannot login
- [ ] Verified user can login
- [ ] Proper error messages shown
- [ ] Token generated for verified users

### Resend Verification:
- [ ] New code generated
- [ ] New email sent
- [ ] Old code invalidated
- [ ] Proper success message

### User Profile:
- [ ] emailVerified field included
- [ ] Correct verification status shown

## Troubleshooting

### Email Not Received:
1. Check EMAIL_USER and EMAIL_PASSWORD in environment
2. Check Gmail spam folder
3. Verify Gmail app password is correct
4. Check console logs for email sending errors

### Verification Code Issues:
1. Check if code is expired (10 minutes)
2. Verify code format (6 digits)
3. Check if user is already verified
4. Try resending verification email

### Login Issues:
1. Ensure email is verified before login
2. Check if user exists in database
3. Verify password is correct
4. Check emailVerified field in database

## Database Schema

### Client Model Updates:
```javascript
{
  // ... existing fields
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date }
}
```

## Security Features

- ✅ Email format validation
- ✅ Domain existence verification
- ✅ Disposable email blocking
- ✅ Verification code expiration (10 minutes)
- ✅ One-time use verification codes
- ✅ Login restriction for unverified users
- ✅ Secure code generation (6-digit random)

Your email verification system is now fully functional and secure! 🎉 