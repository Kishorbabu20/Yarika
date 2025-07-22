const mongoose = require("mongoose");
const Product = require("./models/Product");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/yarika", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateSeoUrl = (name, code) => {
  // Create SEO URL from product name and code
  const baseName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  const codePart = code.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `${baseName}-${codePart}`;
};

const updateProductsWithSeoUrls = async () => {
  try {
    console.log("Starting SEO URL generation for existing products...");
    
    // Find all products without seoUrl
    const productsWithoutSeoUrl = await Product.find({ 
      $or: [
        { seoUrl: { $exists: false } },
        { seoUrl: null },
        { seoUrl: "" }
      ]
    });
    
    console.log(`Found ${productsWithoutSeoUrl.length} products without SEO URLs`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const product of productsWithoutSeoUrl) {
      try {
        const seoUrl = generateSeoUrl(product.name, product.code);
        
        // Check if this SEO URL already exists
        const existingProduct = await Product.findOne({ seoUrl });
        if (existingProduct) {
          // If exists, add a unique suffix
          const uniqueSeoUrl = `${seoUrl}-${Date.now()}`;
          product.seoUrl = uniqueSeoUrl;
        } else {
          product.seoUrl = seoUrl;
        }
        
        await product.save();
        console.log(`Updated product "${product.name}" with SEO URL: ${product.seoUrl}`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating product "${product.name}":`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nSEO URL generation completed:`);
    console.log(`- Successfully updated: ${updatedCount} products`);
    console.log(`- Errors: ${errorCount} products`);
    
  } catch (error) {
    console.error("Error in SEO URL generation:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
updateProductsWithSeoUrls(); 