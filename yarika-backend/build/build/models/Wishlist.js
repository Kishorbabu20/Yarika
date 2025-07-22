const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
    index: true
  },
  items: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate items in a user's wishlist
WishlistSchema.index({ userId: 1, "items.productId": 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", WishlistSchema);