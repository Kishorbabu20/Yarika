const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Super Admin", "user"], default: "user" },
  addedOn: { type: String }, // e.g., "30/06/2025"
  status: { type: String, enum: ["Active", "Removed"], default: "Active" },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Hash password before saving
adminSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
adminSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// Generate JWT Token
adminSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role.toLowerCase(), // Convert role to lowercase for consistent checks
      email: this.email,
      username: this.username,
      name: this.name,
      status: this.status
    },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" } // Extended to 7 days
  );
};

module.exports = mongoose.model("Admin", adminSchema);
