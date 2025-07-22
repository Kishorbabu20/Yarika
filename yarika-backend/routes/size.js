const express = require("express");
const router = express.Router();
const Size = require("../models/Size");

// GET all sizes
router.get("/", async (req, res) => {
  try {
    const sizes = await Size.find().sort({ createdAt: -1 });
    res.json(sizes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sizes" });
  }
});

// POST create size
router.post("/", async (req, res) => {
  try {
    const { name, status } = req.body;
    const size = new Size({ name, status });
    await size.save();
    res.status(201).json(size);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update size
router.put("/:id", async (req, res) => {
  try {
    const { name, status } = req.body;
    const size = await Size.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    );
    res.json(size);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE size
router.delete("/:id", async (req, res) => {
  try {
    await Size.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 