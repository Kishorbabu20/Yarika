const mongoose = require('mongoose');

// Define the schema with seoUrl field
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
    min: 0
  },
  totalStock: { 
    type: Number, 
    default: 0
  },
  sizeStocks: {
    type: Map,
    of: Number,
    default: {}
  },
  sizes: {
    type: [String],
    required: true
  },
  colors: {
    type: [String],
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  additionalImages: [String],
  seoUrl: {
    type: String,
    required: true,
    trim: true
  },
  productDescriptionWeb: String,
  productDescriptionMobile: String,
  shortDescriptionWeb: String,
  shortDescriptionMobile: String,
  soldCount: { 
    type: Number, 
    default: 0
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

// Create the model
const TestProduct = mongoose.model("TestProduct", productSchema);

async function testSchema() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yarika');
    console.log('Connected to database');

    // Check if seoUrl field exists in schema
    console.log('\n=== SCHEMA TEST ===');
    console.log('seoUrl field in schema:', productSchema.paths.seoUrl ? 'YES' : 'NO');
    if (productSchema.paths.seoUrl) {
      console.log('seoUrl field options:', productSchema.paths.seoUrl.options);
    }

    // Test query with the new model
    console.log('\n=== QUERY TEST ===');
    const products = await TestProduct.find({ name: 'Embroidery Blouse' }).select('_id name seoUrl');
    console.log('Products found:', products.length);
    
    if (products.length > 0) {
      const product = products[0];
      console.log('Product _id:', product._id);
      console.log('Product name:', product.name);
      console.log('Product seoUrl:', product.seoUrl);
      console.log('Product seoUrl type:', typeof product.seoUrl);
      console.log('All fields:', Object.keys(product.toObject()));
    }

    await mongoose.connection.close();
    console.log('\nTest completed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

testSchema(); 