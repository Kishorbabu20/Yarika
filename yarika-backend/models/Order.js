const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: false // Made optional to support guest orders
  },
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: [true, "Product ID is required"]
      },
      size: { 
        type: String, 
        required: [true, "Size is required"],
        trim: true
      },
      color: { 
        type: String, 
        required: [true, "Color is required"],
        trim: true
      },
      quantity: { 
        type: Number, 
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
      },
      price: { 
        type: Number, 
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
      },
    }
  ],
  totalAmount: { 
    type: Number, 
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"]
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    default: "Pending",
    enum: {
      values: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      message: "{VALUE} is not a valid status"
    }
  },
  // Payment related fields
  razorpay_order_id: { 
    type: String,
    sparse: true,
    trim: true
  },
  razorpay_payment_id: { 
    type: String,
    sparse: true,
    trim: true
  },
  payment_status: { 
    type: String, 
    default: "Pending", 
    enum: {
      values: ["Pending", "Completed", "Failed"],
      message: "{VALUE} is not a valid payment status"
    }
  },
  payment_method: { 
    type: String, 
    default: "Razorpay",
    enum: {
      values: ["Razorpay"],
      message: "{VALUE} is not a supported payment method"
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total items count
OrderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to validate total amount
OrderSchema.pre('save', function(next) {
  try {
    const calculatedTotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - this.totalAmount) > 0.01) {
      throw new Error(`Total amount mismatch: calculated ${calculatedTotal} but got ${this.totalAmount}`);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Order", OrderSchema); 