const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI
async function setupAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Hash the password
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Super Admin
    const superAdmin = await Admin.findOneAndUpdate(
      { email: "admin@yarika.com" },
      {
        name: "Super Admin",
        email: "admin@yarika.com",
        username: "superadmin",
        password: hashedPassword,
        role: "Super Admin",
        status: "Active",
        addedOn: new Date().toLocaleDateString("en-GB")
      },
      { upsert: true, new: true }
    );
    console.log("Super Admin created/updated:", superAdmin.email);

    // Create Regular Admin
    const admin = await Admin.findOneAndUpdate(
      { username: "admin" },
      {
        name: "Admin",
        email: "admin@yarika.in",
        username: "admin",
        password: hashedPassword,
        role: "Admin",
        status: "Active",
        addedOn: new Date().toLocaleDateString("en-GB")
      },
      { upsert: true, new: true }
    );
    console.log("Admin created/updated:", admin.username);

    console.log("\nAdmin Credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    
    console.log("\nSuper Admin Credentials:");
    console.log("Email: admin@yarika.com");
    console.log("Password: admin123");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

setupAdmins(); 