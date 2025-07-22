const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const MONGO_URI = "mongodb+srv://Yarika:qw12w2e3q1r4QWER_@cluster0.8ehwkwy.mongodb.net/yarika?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
  try {
    const admins = await Admin.find().select('-password');
    console.log('Current Admin Accounts:');
    admins.forEach(admin => {
      console.log(`\nName: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Username: ${admin.username}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Status: ${admin.status}`);
      console.log('------------------------');
    });
  } catch (err) {
    console.error("Error checking admin accounts:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed");
  }
}); 