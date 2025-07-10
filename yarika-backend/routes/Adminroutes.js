const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// ADMIN/USER LOGIN - No protection needed
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    
    // Try to find admin by email or username
    const admin = await Admin.findOne({
      $or: [
        { email: email },
        { username: email } // Using email field from request to check username too
      ]
    });

    if (!admin) {
      console.log('User not found for identifier:', email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Found user:', admin.email, 'Role:', admin.role);
    const isMatch = await admin.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', admin.email);
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token using the model method
    const token = admin.generateToken();

    res.json({ 
      token, 
      role: admin.role, 
      name: admin.name, 
      email: admin.email,
      username: admin.username
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// All routes below this line require admin authentication
router.use(protect({ model: "admin" }));

// CREATE: Add new admin/user
router.post("/add", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;
    
    // Check if email or username already exists
    const existingUser = await Admin.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 
          "Email already in use" : 
          "Username already taken" 
      });
    }

    const newAdmin = await Admin.create({
      name,
      email,
      username,
      password, // Will be hashed by the pre-save hook
      role: role || "user", // Default to user if not specified
      status: "Active",
      addedOn: new Date().toLocaleDateString("en-GB")
    });

    res.json({
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      username: newAdmin.username,
      role: newAdmin.role
    });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ message: "Failed to add user" });
  }
});

// READ: Get all users (returns plain array)
router.get("/", async (req, res) => {
  try {
    const users = await Admin.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// UPDATE: Edit user by ID
router.put("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE: Remove user by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

// GET /api/admin/count - Get total number of users
router.get("/count", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error counting users:", error);
    res.status(500).json({ message: "Failed to count users" });
  }
});

module.exports = router;
