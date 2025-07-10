const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const protect = require("../middleware/auth");

// Get user's wishlist
router.get("/", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const wishlist = await Wishlist.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name code mainImage mrp sellingPrice totalStock status"
      });

    if (!wishlist) {
      return res.json({ items: [] });
    }

    // Transform the data to match frontend needs
    const transformedItems = wishlist.items
      .filter(item => item.productId) // Only include items with a valid product
      .map(item => ({
        _id: item._id, // <-- Add this line
        id: item.productId._id,
        name: item.productId.name,
        sku: item.productId.code,
        currentPrice: item.productId.sellingPrice,
        originalPrice: item.productId.mrp,
        status: item.productId.totalStock > 0 ? "In stock" : "Out of stock",
        image: item.productId.mainImage,
        addedAt: item.addedAt
      }));

    res.json({ items: transformedItems });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Add item to wishlist
router.post("/add", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Try to find existing wishlist or create new one
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if item already exists
    const itemExists = wishlist.items.some(item => 
      item.productId.toString() === productId
    );

    if (itemExists) {
      return res.status(400).json({ error: "Item already in wishlist" });
    }

    // Add new item
    wishlist.items.push({ productId });
    await wishlist.save();

    // Return updated wishlist with populated items
    const updatedWishlist = await Wishlist.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name code mainImage mrp sellingPrice totalStock status"
      });

    const transformedItems = updatedWishlist.items
      .filter(item => item.productId) // Only include items with a valid product
      .map(item => ({
        _id: item._id, // <-- Add this line for wishlist item id
        id: item.productId._id,
        name: item.productId.name,
        sku: item.productId.code,
        currentPrice: item.productId.sellingPrice,
        originalPrice: item.productId.mrp,
        status: item.productId.totalStock > 0 ? "In stock" : "Out of stock",
        image: item.productId.mainImage,
        addedAt: item.addedAt
      }));

    res.json({ items: transformedItems });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Item already in wishlist" });
    }
    res.status(500).json({ error: "Failed to add item to wishlist" });
  }
});

// Remove item from wishlist
router.delete("/remove/:productId", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    // Remove item
    wishlist.items = wishlist.items.filter(item => 
      item.productId.toString() !== productId
    );

    await wishlist.save();

    // Return updated wishlist with populated items
    const updatedWishlist = await Wishlist.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name code mainImage mrp sellingPrice totalStock status"
      });

    const transformedItems = updatedWishlist.items
      .filter(item => item.productId) // Only include items with a valid product
      .map(item => ({
        _id: item._id, // <-- Add this line for wishlist item id
        id: item.productId._id,
        name: item.productId.name,
        sku: item.productId.code,
        currentPrice: item.productId.sellingPrice,
        originalPrice: item.productId.mrp,
        status: item.productId.totalStock > 0 ? "In stock" : "Out of stock",
        image: item.productId.mainImage,
        addedAt: item.addedAt
      }));

    res.json({ items: transformedItems });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ error: "Failed to remove item from wishlist" });
  }
});

// Remove item from wishlist by wishlist item _id
router.delete("/remove-item/:itemId", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { itemId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(item => item._id.toString() !== itemId);
    await wishlist.save();

    // Return updated wishlist with populated items
    const updatedWishlist = await Wishlist.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name code mainImage mrp sellingPrice totalStock status"
      });

    const transformedItems = updatedWishlist.items
      .filter(item => item.productId) // Only include items with a valid product
      .map(item => ({
        _id: item._id, // <-- Add this line for wishlist item id
        id: item.productId._id,
        name: item.productId.name,
        sku: item.productId.code,
        currentPrice: item.productId.sellingPrice,
        originalPrice: item.productId.mrp,
        status: item.productId.totalStock > 0 ? "In stock" : "Out of stock",
        image: item.productId.mainImage,
        addedAt: item.addedAt
      }));

    res.json({ items: transformedItems });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ error: "Failed to remove item from wishlist" });
  }
});

// Clear wishlist
router.delete("/clear", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    await Wishlist.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );
    res.json({ items: [] });
  } catch (err) {
    console.error("Error clearing wishlist:", err);
    res.status(500).json({ error: "Failed to clear wishlist" });
  }
});

module.exports = router; 