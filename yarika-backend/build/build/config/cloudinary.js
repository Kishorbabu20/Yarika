const cloudinary = require('cloudinary').v2;

// Validate required environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingEnvVars);
  throw new Error(`Missing required Cloudinary environment variables: ${missingEnvVars.join(', ')}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
try {
  const testConfig = cloudinary.config();
  console.log("Cloudinary configured successfully with cloud name:", testConfig.cloud_name);
} catch (error) {
  console.error("Failed to configure Cloudinary:", error);
  throw error;
}

module.exports = { cloudinary };

