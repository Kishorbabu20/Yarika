const mongoose = require("mongoose");

const ColorGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  colors: [
    {
      name: { type: String, required: true },
      code: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ColorGroup", ColorGroupSchema); 