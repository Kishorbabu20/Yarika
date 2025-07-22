const express = require("express");
const router = express.Router();
const SizeGroup = require("../models/SizeGroup");

// GET all size groups
router.get("/", async (req, res) => {
  try {
    const groups = await SizeGroup.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch size groups" });
  }
});

// POST create size group
router.post("/", async (req, res) => {
  try {
    const { name, sizes } = req.body;
    const group = new SizeGroup({ name, sizes });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update size group
router.put("/:id", async (req, res) => {
  try {
    const { name, sizes } = req.body;
    const group = await SizeGroup.findByIdAndUpdate(
      req.params.id,
      { name, sizes },
      { new: true }
    );
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE size group
router.delete("/:id", async (req, res) => {
  try {
    await SizeGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 