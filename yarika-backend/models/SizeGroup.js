const mongoose = require("mongoose");

const SizeGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  sizes: [
    {
      name: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SizeGroup", SizeGroupSchema); 