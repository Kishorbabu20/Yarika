const mongoose = require('mongoose');
const Product = require('./models/Product');

// Function to generate SEO URL
const generateSeoUrl = (productName, categoryType, category) => {
  if (!productName) return "";
  
  // Convert product name to URL-friendly format
  let seoUrl = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
  
  // Add category prefix for uniqueness
  if (categoryType && category) {
    seoUrl = `${category}-${seoUrl}`;
  }
  
  // Add a unique suffix to avoid conflicts
  const timestamp = Date.now().toString().slice(-4);
  seoUrl = `${seoUrl}-${timestamp}`;
  
  return seoUrl;
};

async function generateSeoUrlsForExisting() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yarika');
    console.log('Connected to database');

    // Find products without seoUrl
    const productsWithoutSeoUrl = await Product.find({
      $or: [
        { seoUrl: { $exists: false } },
        { seoUrl: null },
        { seoUrl: "" }
      ]
    });

    console.log(`Found ${productsWithoutSeoUrl.length} products without SEO URLs`);

    if (productsWithoutSeoUrl.length === 0) {
      console.log('All products already have SEO URLs!');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const product of productsWithoutSeoUrl) {
      try {
        const seoUrl = generateSeoUrl(product.name, product.categoryType, product.category);
        
        // Check if this SEO URL already exists
        const existingProduct = await Product.findOne({ seoUrl });
        if (existingProduct) {
          console.log(`SEO URL ${seoUrl} already exists for product ${existingProduct.name}, skipping ${product.name}`);
          continue;
        }

        // Update the product with the new SEO URL
        await Product.findByIdAndUpdate(product._id, { seoUrl });
        console.log(`Updated product "${product.name}" with SEO URL: ${seoUrl}`);
        updatedCount++;

      } catch (error) {
        console.error(`Error updating product "${product.name}":`, error.message);
        errorCount++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Products updated: ${updatedCount}`);
    console.log(`- Errors: ${errorCount}`);
    console.log(`- Total products processed: ${productsWithoutSeoUrl.length}`);

    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
  }
}

generateSeoUrlsForExisting(); 