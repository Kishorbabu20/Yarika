const express = require("express");
const router = express.Router();
const BatchProduct = require("../models/BatchProduct");
const ColorGroup = require("../models/ColorGroup"); // Import at the top
const Color = require("../models/Color"); // Import at the top
const Product = require("../models/Product"); // Import Product model

// Get all batch products
router.get("/", async (req, res) => {
  try {
    const products = await BatchProduct.find().sort({ createdAt: -1 });
    // Populate color code for each product by matching with Product colors
    const populatedProducts = await Promise.all(products.map(async (batchProduct) => {
      let colorObj = { name: batchProduct.color?.name || "Unknown", code: batchProduct.color?.code || "#000000" };
      // Try to find a product with the same name as the batch product
      const product = await Product.findOne({ name: batchProduct.name });
      if (product && Array.isArray(product.colors)) {
        // Try to match color by name (case-insensitive)
        const matchedColorName = product.colors.find(
          c => c.toLowerCase() === (batchProduct.color?.name || "").toLowerCase()
        );
        if (matchedColorName) {
          // Find the color code from the Color collection
          const colorDoc = await Color.findOne({ name: new RegExp(`^${matchedColorName}$`, 'i') });
          if (colorDoc) {
            colorObj = { name: colorDoc.name, code: colorDoc.code };
          }
        }
      }
      return {
        ...batchProduct.toObject(),
        color: colorObj
      };
    }));
    res.json(populatedProducts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch batch products" });
  }
});

// Add a new batch product
router.post("/", async (req, res) => {
  try {
    // Extract color info from request
    let colorName = req.body.colorName;
    let colorCode = req.body.colorCode;
    // If color is sent as an object or array, handle that too
    if (!colorName && req.body.color && typeof req.body.color === 'object') {
      colorName = req.body.color.name || req.body.color[0]?.name;
      colorCode = req.body.color.code || req.body.color[0]?.code;
    }
    const newBatchProduct = new BatchProduct({
      date: new Date(),
      name: req.body.name,
      serialNo: req.body.serialNo || req.body.code, // Accepts either field
      by: req.admin?.name || req.admin?.username || "Unknown", // get from session
      soldStatus: "Unsold",
      soldTo: "",
      returned: "No",
      size: Array.isArray(req.body.sizes) ? req.body.sizes[0] : req.body.size || "", // or as appropriate
      color: Array.isArray(req.body.colors) && req.body.colors.length > 0
  ? { name: req.body.colors[0], code: "" }
  : { name: "Unknown", code: "#000000" },
      status: "Active"
    });
    await newBatchProduct.save();
    res.status(201).json(newBatchProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a batch product
router.put("/:id", async (req, res) => {
  try {
    const product = await BatchProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a batch product
router.delete("/:id", async (req, res) => {
  try {
    await BatchProduct.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Test endpoint to verify route registration
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Batch & Products route is working!' });
});

module.exports = router; 