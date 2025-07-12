const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  brand: String,
  categoryType: String,
  category: String,
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
    required: true,
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
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
  additionalImages: [String],
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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create unique index for code field
productSchema.index({ code: 1 }, { unique: true });

// Virtual for hasStock
productSchema.virtual('hasStock').get(function() {
  return this.totalStock > 0;
});

// Pre-save middleware to update status based on stock
productSchema.pre('save', async function(next) {
  try {
    // Calculate total stock from sizeStocks if it exists
    if (this.sizeStocks) {
      const totalFromSizes = Array.from(this.sizeStocks.values()).reduce((sum, stock) => sum + (stock || 0), 0);
      this.totalStock = totalFromSizes;
      
      // Log the stock calculation
      console.log('Calculating total stock:', {
        name: this.name,
        code: this.code,
        sizeStocks: Object.fromEntries(this.sizeStocks),
        totalFromSizes,
        previousTotal: this.totalStock
      });
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

    // Validate totalStock and soldCount are non-negative
    if (this.totalStock < 0) {
      throw new Error(`Cannot set negative total stock (${this.totalStock}) for product ${this.name} (${this.code})`);
    }
    if (this.soldCount < 0) {
      throw new Error(`Cannot set negative soldCount (${this.soldCount}) for product ${this.name} (${this.code})`);
    }

    // Validate selling price is not greater than MRP
    if (this.sellingPrice > this.mrp) {
      throw new Error(`Selling price (${this.sellingPrice}) cannot be greater than MRP (${this.mrp}) for product ${this.name} (${this.code})`);
    }

    // Log the final state
    console.log('Product final state:', {
      name: this.name,
      code: this.code,
      totalStock: this.totalStock,
      sizeStocks: Object.fromEntries(this.sizeStocks),
      status: this.status
    });
  
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

module.exports = mongoose.model("Product", productSchema);
