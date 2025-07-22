const mongoose = require("mongoose");

const BatchProductSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  serialNo: { type: String, required: true, unique: true },
  by: { type: String, required: true },
  soldStatus: { type: String, enum: ["Sold", "Unsold"], default: "Unsold" },
  soldTo: { type: String, default: "" },
  returned: { type: String, enum: ["Yes", "No"], default: "No" },
  size: { type: String, required: true },
  color: {
    name: { type: String, required: true },
    code: { type: String, required: true }
  },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("BatchProduct", BatchProductSchema); 