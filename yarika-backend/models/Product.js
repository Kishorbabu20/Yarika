const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  brand: String,
  categoryType: { type: String, required: true }, // e.g., 'bridal'
  category: { type: String, required: true },     // e.g., 'bridal-lehenga'
  group: String,
  code: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true
  },
  name: { 
    type: String,
    required: true,
    trim: true
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.mrp;
      },
      message: 'Selling price cannot be greater than MRP'
    }
  },
  totalStock: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: props => `Total stock cannot be negative (${props.value})`
    }
  },
  sizeStocks: {
    type: Map,
    of: Number,
    default: {},
    validate: {
      validator: function(value) {
        console.log('Validating sizeStocks:', {
          value,
          type: typeof value,
          isMap: value instanceof Map,
          values: value instanceof Map ? Array.from(value.values()) : Object.values(value)
        });
        // Ensure all stock values are non-negative
        const values = value instanceof Map ? Array.from(value.values()) : Object.values(value);
        const allValid = values.every(stock => {
          const isValid = stock >= 0;
          if (!isValid) {
            console.log('Invalid stock value:', stock);
          }
          return isValid;
        });
        return allValid;
      },
      message: 'Size stock values cannot be negative'
    }
  },
  sizes: {
    type: [String],
    required: function() { return this.categoryType !== 'bridal'; },
    validate: {
      validator: function(arr) {
        // Allow empty sizes for bridal products
        if (this.categoryType === 'bridal') return true;
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'At least one size must be specified'
    }
  },
  colors: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one color must be specified'
    }
  },
  mainImage: {
    type: String,
    required: true
  },
  mainImageAlt: {
    type: String,
    trim: true
  },
  additionalImages: [String],
  additionalImageAlts: [String],
  seoUrl: { type: String, required: true, unique: true },
  // SEO Meta fields
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  productDescriptionWeb: String,
  productDescriptionMobile: String,
  shortDescriptionWeb: String,
  shortDescriptionMobile: String,
  soldCount: { 
    type: Number, 
    default: 0,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: props => `Sold count cannot be negative (${props.value})`
    }
  },
  status: {
    type: String,
    enum: ["active", "out-of-stock", "discontinued"],
    default: "active",
  },
  taxClass: {
    type: String,
    enum: ["gst-5", "gst-12"],
    default: "gst-5",
  },
  qrSize: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "small",
  },
  netWeight: {
    type: String,
    required: true,
    trim: true
  },
  grossWeight: {
    type: String,
    required: true,
    trim: true
  },
  maxOrderQuantity: {
    type: String,
    required: true,
    trim: true
  },
  // Key Highlights fields
  fabric: {
    type: String,
    trim: true
  },
  neck: {
    type: String,
    trim: true
  },
  sleeveStyling: {
    type: String,
    trim: true
  },
  sleeveLength: {
    type: String,
    trim: true
  },
  qrCodeDataUrl: {
    type: String,
    trim: true
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create unique index for code field
productSchema.index({ code: 1 }, { unique: true });

// Create unique index for seoUrl field
productSchema.index({ seoUrl: 1 }, { unique: true });

// Virtual for hasStock
productSchema.virtual('hasStock').get(function() {
  return this.totalStock > 0;
});

// Pre-save middleware to update status based on stock
productSchema.pre('save', async function(next) {
  try {
    let totalFromSizes = 0;
    
    // Calculate total stock from sizeStocks
    if (this.isModified('sizeStocks') && this.sizeStocks) {
      totalFromSizes = Array.from(this.sizeStocks.values()).reduce((sum, stock) => sum + (stock || 0), 0);
      
      // Log the stock calculation
      console.log('Recalculating total stock due to sizeStocks modification:', {
        name: this.name,
        code: this.code,
        sizeStocks: Object.fromEntries(this.sizeStocks),
        totalFromSizes,
        previousTotal: this.totalStock
      });
    }

    // Update total stock
    if (this.isModified('sizeStocks')) {
      this.totalStock = totalFromSizes;
    }

    // Update status based on totalStock
    if (this.status !== 'discontinued') {
      const newStatus = this.totalStock > 0 ? 'active' : 'out-of-stock';
      if (this.status !== newStatus) {
        console.log('Updating status:', {
          name: this.name,
          code: this.code,
          oldStatus: this.status,
          newStatus,
          totalStock: this.totalStock
        });
        this.status = newStatus;
      }
    }
  
    next();
  } catch (error) {
    next(error);
  }
});

// Add a method to safely update stock
productSchema.methods.updateStock = async function(quantity, size, session) {
  console.log(`Updating stock for product ${this.name} (${this._id}):`, {
    currentTotalStock: this.totalStock,
    currentSizeStock: this.sizeStocks.get(size),
    size,
    quantityToDeduct: quantity
  });

  const sizeStock = this.sizeStocks.get(size) || 0;
  if (sizeStock < quantity) {
    throw new Error(`Insufficient stock for ${this.name} (${this._id}) size ${size}. Required: ${quantity}, Available: ${sizeStock}`);
  }

  this.sizeStocks.set(size, sizeStock - quantity);
  this.totalStock -= quantity;
  this.soldCount = (this.soldCount || 0) + quantity;

  try {
    const savedProduct = await this.save({ session });
    console.log(`Stock updated successfully for ${this.name}:`, {
      previousStock: this.totalStock + quantity,
      newStock: savedProduct.totalStock,
      sizeStock: savedProduct.sizeStocks.get(size),
      soldCount: savedProduct.soldCount
    });
    return savedProduct;
  } catch (error) {
    console.error(`Failed to update stock for ${this.name}:`, error);
    throw error;
  }
};

// Add a method to reserve stock temporarily (for checkout process)
productSchema.methods.reserveStock = async function(quantity, size) {
  console.log(`Reserving stock for product ${this.name} (${this._id}):`, {
    currentTotalStock: this.totalStock,
    currentSizeStock: this.sizeStocks.get(size),
    size,
    quantityToReserve: quantity
  });

  const sizeStock = this.sizeStocks.get(size) || 0;
  if (sizeStock < quantity) {
    throw new Error(`Insufficient stock for ${this.name} (${this._id}) size ${size}. Required: ${quantity}, Available: ${sizeStock}`);
  }

  // Don't actually update stock, just validate availability
  return {
    available: true,
    currentStock: sizeStock,
    requestedQuantity: quantity
  };
};

// Add a method to check stock availability without updating
productSchema.methods.checkStockAvailability = function(quantity, size) {
  const sizeStock = this.sizeStocks.get(size) || 0;
  return {
    available: sizeStock >= quantity,
    currentStock: sizeStock,
    requestedQuantity: quantity
  };
};

module.exports = mongoose.model("Product", productSchema);
