const express = require("express");
const router = express.Router();
const ColorGroup = require("../models/ColorGroup");

// GET all color groups
router.get("/", async (req, res) => {
  try {
    const groups = await ColorGroup.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch color groups" });
  }
});

// POST create color group
router.post("/", async (req, res) => {
  try {
    const { name, colors } = req.body;
    const group = new ColorGroup({ name, colors });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update color group
router.put("/:id", async (req, res) => {
  try {
    const { name, colors } = req.body;
    const group = await ColorGroup.findByIdAndUpdate(
      req.params.id,
      { name, colors },
      { new: true }
    );
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE color group
router.delete("/:id", async (req, res) => {
  try {
    await ColorGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 