const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem");
const protect = require("../middleware/auth");
const Product = require("../models/Product");

// Debug middleware for cart routes
router.use((req, res, next) => {
  console.log('Cart Route Debug ==================');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Auth Token:', req.headers.authorization);
  console.log('====================================');
  next();
});

// GET /api/cart - Get all cart items (populated)
router.get("/", protect({ model: "client" }), async (req, res) => {
  try {
    console.log('GET /api/cart - Auth check passed');
    const userId = req.client._id;
    console.log('Fetching cart for user:', userId);
    
    const cart = await CartItem.find({ userId }).populate("productId");
    console.log('Cart found:', cart ? 'yes' : 'no');

    if (!cart || cart.length === 0) {
      console.log('No cart items found, returning empty array');
      return res.json([]);
    }

    console.log('Returning cart with', cart.length, 'items');
    res.json(cart);
  } catch (err) {
    console.error("Failed to load cart:", err);
    res.status(500).json({ 
      error: "Failed to load cart",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// POST /api/cart/add - Add item to cart
router.post("/add", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { productId, size, color, qty = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({ error: "Product ID and size are required" });
    }

    let item = await CartItem.findOne({ userId, productId, size });

    if (item) {
      item.qty = Math.min(25, item.qty + qty);
      await item.save();
    } else {
      item = new CartItem({ userId, productId, size, color, qty });
      await item.save();
    }

    const updatedCart = await CartItem.find({ userId }).populate("productId");
    res.json(updatedCart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// DELETE /api/cart/remove/:id - Remove item
router.delete("/remove/:id", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { id } = req.params;
    const { size } = req.query;

    if (!id || !size) {
      return res.status(400).json({ error: "Product ID and size are required" });
    }

    const result = await CartItem.deleteOne({ userId, productId: id, size });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    const updatedCart = await CartItem.find({ userId }).populate("productId");
    res.json(updatedCart);
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// PUT /api/cart/update - Update quantity
router.put("/update", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { productId, size, qty } = req.body;

    if (!productId || !size || typeof qty !== 'number') {
      return res.status(400).json({ error: "Product ID, size, and quantity are required" });
    }

    const item = await CartItem.findOne({ userId, productId, size });

    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    item.qty = Math.max(1, Math.min(25, qty));
    await item.save();

    const updatedCart = await CartItem.find({ userId }).populate("productId");
    res.json(updatedCart);
  } catch (err) {
    console.error("Update quantity error:", err);
    res.status(500).json({ error: "Failed to update quantity" });
  }
});

// DELETE /api/cart/clear - Clear all items
router.delete("/clear", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const result = await CartItem.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Cart is already empty" });
    }

    res.json([]);
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// POST /api/cart/calculate-tax
router.post("/calculate-tax", async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity, price, ... }]
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "No items provided" });
    }

    let totalTax = 0;
    let taxBreakdown = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // Example: 12% GST for all products, or use product.taxClass if you have different rates
      const taxRate = 0.12; // 12%
      const itemTax = (item.price * item.quantity) * taxRate;

      totalTax += itemTax;
      taxBreakdown.push({
        productId: item.productId,
        tax: itemTax,
        taxRate,
      });
    }

    res.json({
      totalTax: Number(totalTax.toFixed(2)),
      taxBreakdown,
    });
  } catch (err) {
    console.error("Tax calculation error:", err);
    res.status(500).json({ error: "Failed to calculate tax" });
  }
});

module.exports = router;
