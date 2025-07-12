# Environment Variables Setup

Create a `.env` file in the root of your backend directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://Yarika:qw12w2e3q1r4QWER_@cluster0.8ehwkwy.mongodb.net/yarika?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_SECRET_CODE=your-google-client-secret

# Session Configuration
SESSION_SECRET=your-session-secret-change-this-in-production

# Environment
NODE_ENV=production

# Server Configuration
PORT=5001
```

## How to create the .env file:

1. Create a new file named `.env` in the `yarika-backend` directory
2. Copy the content above into the file
3. Replace the placeholder values with your actual credentials
4. Save the file

## Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Authorized redirect URIs to: `https://yarika.in/api/google/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## Security Notes:

- Never commit the `.env` file to Git
- The `.env` file is already in `.gitignore`
- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- Keep your MongoDB URI secure
- Keep your Google OAuth credentials secure

## Current File Structure:

### Core Application Files:
- `index.js` - Main server file (✅ Updated to use environment variables)

### Utility Scripts (for maintenance):
- `updateProducts.js` - Update product data
- `migrateStockFields.js` - Migrate stock field formats
- `fixWishlistItems.js` - Fix wishlist data
- `fixProductStatus.js` - Fix product status
- `fixProducts.js` - Fix product data
- `CreateAdmin.js` - Create admin users
- `updateAdminPassword.js` - Update admin passwords
- `fixAdmins.js` - Fix admin data
- `checkAdmins.js` - Check admin data
- `setupAdmins.js` - Setup admin accounts

### Migration Files (Removed):
- ~~`migrateToAtlas.js`~~ - One-time migration script (deleted)
- ~~`importFixedData.js`~~ - One-time import script (deleted)
- ~~`importOrdersOnly.js`~~ - One-time import script (deleted)
- ~~`fixMigrationData.js`~~ - One-time data fix script (deleted)
- ~~`fixOrderData.js`~~ - One-time order fix script (deleted)
- ~~`backup-data*.json`~~ - Migration backup files (deleted)

## What was updated:

All hardcoded MongoDB URIs have been replaced with `process.env.MONGO_URI` in:
- `index.js` (main server file) ✅
- `updateProducts.js` ✅
- `migrateStockFields.js` ✅
- `fixWishlistItems.js` ✅
- `fixProductStatus.js` ✅
- `fixProducts.js` ✅

The fallback value ensures the app still works if the environment variable is not set. 