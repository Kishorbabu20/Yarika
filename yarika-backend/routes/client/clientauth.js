const express = require("express");
const router = express.Router();
const Client = require("../../models/Client");
const protect = require("../../middleware/auth");

// @desc    Test route
// @route   GET /api/client/test
router.get("/test", (req, res) => {
  res.send("Client route is active ✅");
});

// @desc    Register client
// @route   POST /api/client/register
// @access  Public
router.post("/register", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword
    } = req.body;

    // Basic field check
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Please fill in all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: "Passwords do not match" });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ success: false, error: "Client already exists with this email" });
    }

    const client = await Client.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });

    const token = client.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Client registration error:", err);
    next(err);
  }
});

// OPTIONAL: Add login route if you haven’t already
// @desc    Login client
// @route   POST /api/client/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please enter email and password" });
    }

    const client = await Client.findOne({ email }).select("+password");
    if (!client) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await client.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = client.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phoneNumber: client.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Client login error:", err);
    next(err);
  }
});

// OPTIONAL: Protected route to get client profile
// @route   GET /api/client/me
router.get("/me", protect({ model: "client" }), async (req, res) => {
  const client = await Client.findById(req.client._id);
  res.status(200).json({
    id: client._id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phoneNumber: client.phoneNumber,
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
