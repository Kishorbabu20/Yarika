const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testSeoUrl() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yarika');
    console.log('Connected to database');

    // Test 1: Find product by name
    console.log('\n=== TEST 1: Find by name ===');
    const productByName = await Product.findOne({ name: 'Embroidery Blouse' });
    console.log('Product found by name:', productByName ? 'YES' : 'NO');
    if (productByName) {
      console.log('seoUrl:', productByName.seoUrl);
      console.log('seoUrl type:', typeof productByName.seoUrl);
      console.log('All fields:', Object.keys(productByName.toObject()));
    }

    // Test 2: Find product by ID
    console.log('\n=== TEST 2: Find by ID ===');
    const productById = await Product.findById('68673fcfec9491d650ca9e2f');
    console.log('Product found by ID:', productById ? 'YES' : 'NO');
    if (productById) {
      console.log('seoUrl:', productById.seoUrl);
      console.log('seoUrl type:', typeof productById.seoUrl);
      console.log('All fields:', Object.keys(productById.toObject()));
    }

    // Test 3: Raw MongoDB query
    console.log('\n=== TEST 3: Raw MongoDB query ===');
    const rawProduct = await mongoose.connection.db.collection('products').findOne({ name: 'Embroidery Blouse' });
    console.log('Raw product found:', rawProduct ? 'YES' : 'NO');
    if (rawProduct) {
      console.log('Raw seoUrl:', rawProduct.seoUrl);
      console.log('Raw seoUrl type:', typeof rawProduct.seoUrl);
      console.log('All raw fields:', Object.keys(rawProduct));
    }

    // Test 4: Check schema
    console.log('\n=== TEST 4: Schema check ===');
    const schema = Product.schema;
    console.log('seoUrl field in schema:', schema.paths.seoUrl ? 'YES' : 'NO');
    if (schema.paths.seoUrl) {
      console.log('seoUrl field options:', schema.paths.seoUrl.options);
    }

    await mongoose.connection.close();
    console.log('\nTest completed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

testSeoUrl(); 