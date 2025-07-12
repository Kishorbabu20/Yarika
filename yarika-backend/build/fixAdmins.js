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

async function fixAdminAccounts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    // First, let's remove all existing admin accounts
    const deleteResult = await Admin.deleteMany({});
    console.log("Cleared existing admin accounts:", deleteResult);

    // Hash the password directly
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Super Admin directly without using the model's save hook
    const superAdmin = await Admin.create({
      name: "Super Admin",
      email: "superadmin@yarika.com",
      username: "superadmin",
      password: hashedPassword,
      role: "Super Admin",
      status: "Active",
      addedOn: new Date().toLocaleDateString("en-GB")
    });
    console.log("Created Super Admin:", superAdmin.email);

    // Create Regular Admin directly without using the model's save hook
    const admin = await Admin.create({
      name: "Admin",
      email: "admin@yarika.com",
      username: "admin",
      password: hashedPassword,
      role: "Admin",
      status: "Active",
      addedOn: new Date().toLocaleDateString("en-GB")
    });
    console.log("Created Admin:", admin.email);

    // Verify the accounts were created
    const allAdmins = await Admin.find().select('-password');
    console.log("\nVerifying created accounts:");
    allAdmins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.role})`);
    });

    // Verify password hashing by testing login
    const testAdmin = await Admin.findOne({ email: "admin@yarika.com" });
    const isMatch = await bcrypt.compare("admin123", testAdmin.password);
    console.log("\nPassword verification test:", isMatch ? "PASSED" : "FAILED");
    if (!isMatch) {
      console.log("Stored hash:", testAdmin.password);
      const newHash = await bcrypt.hash("admin123", 10);
      console.log("Test hash:", newHash);
    }

    console.log("\nAdmin Credentials:");
    console.log("Regular Admin:");
    console.log("Email: admin@yarika.com");
    console.log("Username: admin");
    console.log("Password: admin123");
    
    console.log("\nSuper Admin:");
    console.log("Email: superadmin@yarika.com");
    console.log("Username: superadmin");
    console.log("Password: admin123");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\nDatabase connection closed");
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
    process.exit(0);
  }
}

console.log("Starting admin account fix...");
fixAdminAccounts(); 