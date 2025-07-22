const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/auth");
const { logAdminActivity } = require("../utils/adminActivityLogger");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// ADMIN/USER LOGIN - No protection needed
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = admin.generateToken();
    res.json({ success: true, token, admin: { name: admin.name, username: admin.username, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Internal server error" });
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

// GET /api/admin/count - Get total number of active users
router.get("/count", async (req, res) => {
  try {
    const count = await Admin.countDocuments({ status: "Active" }); // Only count active
    res.json({ count });
  } catch (error) {
    console.error("Error counting users:", error);
    res.status(500).json({ message: "Failed to count users" });
  }
});

// POST /api/admin/change-password - Change admin password
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: "Password too short",
        message: "New password must be at least 6 characters long" 
      });
    }

    // Find the admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        error: "Admin not found",
        message: "Admin account not found" 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        error: "Invalid current password",
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedNewPassword;
    await admin.save();

    // Log password change activity
    await logAdminActivity({
      adminId: admin._id,
      adminName: admin.name || admin.username,
      action: 'Password Changed',
      entityType: 'System',
      entityName: 'Admin Account',
      details: `Admin ${admin.name || admin.username} changed their password`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      success: true,
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ 
      error: "Failed to change password",
      message: "An error occurred while changing password" 
    });
  }
});

// GET /api/admins/me - Get current admin info (for testing auth)
router.get("/me", protect({ model: "admin" }), async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        username: req.admin.username,
        role: req.admin.role,
        status: req.admin.status
      }
    });
  } catch (err) {
    console.error("Get admin info error:", err);
    res.status(500).json({ error: "Failed to get admin info" });
  }
});

module.exports = router;
