const mongoose = require("mongoose");

const SizeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Size", SizeSchema); 