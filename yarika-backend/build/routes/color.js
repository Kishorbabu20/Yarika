const express = require("express");
const router = express.Router();
const Color = require("../models/Color");

// GET all colors
router.get("/", async (req, res) => {
  try {
    const colors = await Color.find().sort({ createdAt: -1 });
    res.json(colors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch colors" });
  }
});

// POST create color
router.post("/", async (req, res) => {
  try {
    const { name, code, status } = req.body;
    const color = new Color({ name, code, status });
    await color.save();
    res.status(201).json(color);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update color
router.put("/:id", async (req, res) => {
  try {
    const { name, code, status } = req.body;
    const color = await Color.findByIdAndUpdate(
      req.params.id,
      { name, code, status },
      { new: true }
    );
    res.json(color);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE color
router.delete("/:id", async (req, res) => {
  try {
    await Color.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 