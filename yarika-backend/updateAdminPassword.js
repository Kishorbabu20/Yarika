const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

async function updatePasswords() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Hash the password
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update all admin passwords
    const result = await Admin.updateMany(
      {},
      { $set: { password: hashedPassword } }
    );

    console.log("Updated passwords:", result);

    // Verify the update
    const admins = await Admin.find();
    for (const admin of admins) {
      const isMatch = await bcrypt.compare("admin123", admin.password);
      console.log(`Password verification for ${admin.email}: ${isMatch ? "PASSED" : "FAILED"}`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed");
    process.exit(0);
  }
}

updatePasswords(); 