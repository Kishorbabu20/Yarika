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

async function createAdmin(adminData) {
  try {
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log(`Admin with email ${adminData.email} or username ${adminData.username} already exists`);
      return;
    }

    const hashed = await bcrypt.hash(adminData.password, 10);
    await Admin.create({
      ...adminData,
      password: hashed,
      status: "Active",
      addedOn: new Date().toLocaleDateString("en-GB")
    });
    console.log(`${adminData.role} created successfully: ${adminData.email} (${adminData.username})`);
  } catch (err) {
    console.error(`Error creating ${adminData.role}:`, err);
  }
}

mongoose.connect(MONGO_URI).then(async () => {
  try {
    // Create Super Admin account
    await createAdmin({
      name: "Super Admin",
      email: "superadmin@yarika.com",
      username: "superadmin",
      password: "admin123",
      role: "Super Admin"
    });

    // Create regular Admin account
    await createAdmin({
      name: "Admin",
      email: "admin@yarika.com",
    username: "admin",
      password: "admin123",
      role: "Admin"
  });

  } catch (err) {
    console.error("Error in admin creation process:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
});
