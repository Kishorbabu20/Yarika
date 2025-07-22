const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testCurrent() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yarika');
    console.log('Connected to database');

    // Test 1: Check if seoUrl exists in database
    console.log('\n=== TEST 1: Database Check ===');
    const rawProduct = await mongoose.connection.db.collection('products').findOne({ 
      categoryType: 'readymade-blouse', 
      category: 'embroidery-blouse' 
    });
    console.log('Raw product found:', rawProduct ? 'YES' : 'NO');
    if (rawProduct) {
      console.log('Raw seoUrl:', rawProduct.seoUrl);
      console.log('Raw seoUrl type:', typeof rawProduct.seoUrl);
      console.log('All raw fields:', Object.keys(rawProduct));
    }

    // Test 2: Check Mongoose query
    console.log('\n=== TEST 2: Mongoose Query ===');
    const mongooseProduct = await Product.findOne({ 
      categoryType: 'readymade-blouse', 
      category: 'embroidery-blouse' 
    }).select('_id name categoryType category seoUrl');
    console.log('Mongoose product found:', mongooseProduct ? 'YES' : 'NO');
    if (mongooseProduct) {
      console.log('Mongoose seoUrl:', mongooseProduct.seoUrl);
      console.log('Mongoose seoUrl type:', typeof mongooseProduct.seoUrl);
      console.log('All mongoose fields:', Object.keys(mongooseProduct.toObject()));
    }

    // Test 3: Check schema
    console.log('\n=== TEST 3: Schema Check ===');
    const schema = Product.schema;
    console.log('seoUrl field in schema:', schema.paths.seoUrl ? 'YES' : 'NO');
    if (schema.paths.seoUrl) {
      console.log('seoUrl field options:', schema.paths.seoUrl.options);
    }

    // Test 4: Simulate the exact API query
    console.log('\n=== TEST 4: API Query Simulation ===');
    const query = { categoryType: 'readymade-blouse', category: 'embroidery-blouse' };
    const products = await Product.find(query).select('_id brand categoryType category group code name mrp sellingPrice totalStock sizeStocks sizes colors mainImage additionalImages productDescriptionWeb productDescriptionMobile shortDescriptionWeb shortDescriptionMobile soldCount status createdAt updatedAt __v hasStock seoUrl').sort({ createdAt: -1 });
    console.log('API query products found:', products.length);
    if (products.length > 0) {
      const product = products[0];
      console.log('API product seoUrl:', product.seoUrl);
      console.log('API product seoUrl type:', typeof product.seoUrl);
      console.log('API product all fields:', Object.keys(product.toObject()));
    }

    await mongoose.connection.close();
    console.log('\nTest completed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

testCurrent(); 