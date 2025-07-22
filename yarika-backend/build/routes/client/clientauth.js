const express = require("express");
const router = express.Router();
const Client = require("../../models/Client");
const protect = require("../../middleware/auth");
const { 
  validateEmail, 
  sendVerificationEmail, 
  generateVerificationCode, 
  storeVerificationCode, 
  verifyCode 
} = require("../../services/emailVerificationService");

// @desc    Test route
// @route   GET /api/client/test
router.get("/test", (req, res) => {
  res.send("Client route is active ");
});

// @desc    Register client
// @route   POST /api/client/register
// @access  Public
router.post("/register", async (req, res, next) => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword
    } = req.body;

    // Basic field check
    if (!firstName || !email || !password || !confirmPassword) {
      console.log('Registration failed: Missing required fields');
      console.log('firstName:', !!firstName);
      console.log('email:', !!email);
      console.log('password:', !!password);
      console.log('confirmPassword:', !!confirmPassword);
      return res.status(400).json({
        success: false,
        error: "Please fill in all required fields (First Name, Email, Password, Confirm Password)",
      });
    }

    // Validate email format and domain
    console.log('Validating email:', email);
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      console.log('Email validation failed:', emailValidation.error);
      return res.status(400).json({
        success: false,
        error: emailValidation.error
      });
    }
    console.log('Email validation passed for domain:', emailValidation.domain);

    if (password !== confirmPassword) {
      console.log('Registration failed: Passwords do not match');
      return res.status(400).json({ success: false, error: "Passwords do not match" });
    }

    console.log('Checking if client already exists with email:', email);
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      console.log('Registration failed: Client already exists');
      return res.status(400).json({ success: false, error: "Client already exists with this email" });
    }

    console.log('Creating new client...');
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      emailVerified: false
    });

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    client.emailVerificationCode = verificationCode;
    client.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await client.save();

    // Send verification email
    console.log('Sending verification email...');
    const emailResult = await sendVerificationEmail(email, verificationCode);
    
    if (!emailResult.success) {
      console.warn('Failed to send verification email:', emailResult.error);
      // Continue with registration but warn about email verification
    }

    console.log('Client created successfully, generating token...');
    const token = client.getSignedJwtToken();
    console.log('Token generated successfully');

    res.status(201).json({
      success: true,
      token,
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
        emailVerified: client.emailVerified
      },
      message: "Account created successfully! Please check your email for verification code.",
      requiresVerification: true
    });
  } catch (err) {
    console.error("Client registration error:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    next(err);
  }
});

// OPTIONAL: Add login route if you haven't already
// @desc    Login client
// @route   POST /api/client/login
router.post("/login", async (req, res, next) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ success: false, error: "Please enter email and password" });
    }

    console.log('Looking for client with email:', email);
    const client = await Client.findOne({ email }).select("+password");
    
    if (!client) {
      console.log('Login failed: Client not found');
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    console.log('Client found, checking password...');
    const isMatch = await client.matchPassword(password);
    
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    console.log('Password matched, checking email verification...');
    
    if (!client.emailVerified) {
      console.log('Login failed: Email not verified');
      return res.status(401).json({
        success: false,
        error: "Please verify your email address before logging in. Check your inbox for verification code.",
        requiresVerification: true,
        email: client.email
      });
    }

    const token = client.getSignedJwtToken();
    console.log('Token generated successfully');

    res.status(200).json({
      success: true,
      token,
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
        emailVerified: client.emailVerified,
      },
    });
  } catch (err) {
    console.error("Client login error:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    next(err);
  }
});

// @desc    Verify email with code
// @route   POST /api/client/verify-email
// @access  Public
router.post("/verify-email", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: "Email and verification code are required"
      });
    }

    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (client.emailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified"
      });
    }

    if (!client.emailVerificationCode || !client.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        error: "No verification code found. Please request a new one."
      });
    }

    if (Date.now() > client.emailVerificationExpires.getTime()) {
      return res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new one."
      });
    }

    if (client.emailVerificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code. Please try again."
      });
    }

    // Mark email as verified
    client.emailVerified = true;
    client.emailVerificationCode = undefined;
    client.emailVerificationExpires = undefined;
    await client.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
        emailVerified: client.emailVerified
      }
    });

  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify email"
    });
  }
});

// @desc    Resend verification email
// @route   POST /api/client/resend-verification
// @access  Public
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (client.emailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified"
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    client.emailVerificationCode = verificationCode;
    client.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await client.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again."
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully! Please check your inbox."
    });

  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification email"
    });
  }
});

// @desc    Protected route to get client profile
// @route   GET /api/client/me
router.get("/me", protect({ model: "client" }), async (req, res) => {
  const client = await Client.findById(req.client._id);
  res.status(200).json({
    id: client._id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phoneNumber: client.phoneNumber,
    emailVerified: client.emailVerified,
    addresses: client.addresses
  });
});

// @route   PUT /api/client/me
// @desc    Update client profile
// @access  Private
router.put("/me", protect({ model: "client" }), async (req, res) => {
  const client = req.client;
  const { firstName, lastName, email, phoneNumber } = req.body;

  // Optionally, validate fields here

  client.firstName = firstName ?? client.firstName;
  client.lastName = lastName ?? client.lastName;
  client.email = email ?? client.email;
  client.phoneNumber = phoneNumber ?? client.phoneNumber;

  await client.save();

  res.status(200).json({
    id: client._id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phoneNumber: client.phoneNumber,
    addresses: client.addresses
  });
});

// @route   POST /api/client/address
// @desc    Add new address
// @access  Private
router.post("/address", protect({ model: "client" }), async (req, res) => {
  try {
    const { street, city, state, pincode, isDefault } = req.body;

    // Validate required fields
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        error: "Please provide all address fields"
      });
    }

    const client = await Client.findById(req.client._id);

    // If this is the first address or isDefault is true, update other addresses
    if (isDefault || client.addresses.length === 0) {
      client.addresses.forEach(addr => addr.isDefault = false);
    }

    client.addresses.push({
      street,
      city,
      state,
      pincode,
      isDefault: isDefault || client.addresses.length === 0
    });

    await client.save();

    res.status(201).json({
      success: true,
      addresses: client.addresses
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      error: "Error adding address"
    });
  }
});

// @route   PUT /api/client/address/:addressId
// @desc    Update address
// @access  Private
router.put("/address/:addressId", protect({ model: "client" }), async (req, res) => {
  try {
    const { street, city, state, pincode, isDefault } = req.body;
    const addressId = req.params.addressId;

    const client = await Client.findById(req.client._id);
    const address = client.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found"
      });
    }

    // Update address fields
    address.street = street ?? address.street;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.pincode = pincode ?? address.pincode;

    // Handle default address changes
    if (isDefault) {
      client.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
      });
    }

    await client.save();

    res.status(200).json({
      success: true,
      addresses: client.addresses
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      error: "Error updating address"
    });
  }
});

// @route   DELETE /api/client/address/:addressId
// @desc    Delete address
// @access  Private
router.delete("/address/:addressId", protect({ model: "client" }), async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const client = await Client.findById(req.client._id);
    
    const address = client.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found"
      });
    }

    // If deleting default address, make the first remaining address default
    const wasDefault = address.isDefault;
    client.addresses.pull(addressId);

    if (wasDefault && client.addresses.length > 0) {
      client.addresses[0].isDefault = true;
    }

    await client.save();

    res.status(200).json({
      success: true,
      addresses: client.addresses
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting address"
    });
  }
});

// @route   GET /api/client/all
// @desc    Get all clients (admin only)
// @access  Private/Admin
router.get("/all", protect({ model: "admin" }), async (req, res) => {
  try {
    const clients = await Client.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients.map(client => ({
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
        addresses: client.addresses,
        createdAt: client.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching clients"
    });
  }
});

module.exports = router;
