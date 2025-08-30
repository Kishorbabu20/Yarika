const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: {
      type: String,
      required: false, // Make size optional to handle bridal products
      trim: true,
      default: '', // Default to empty string for bridal products
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Minimum quantity is 1"],
      max: [25, "Maximum quantity is 25"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CartItem", CartItemSchema);
