const mongoose = require("mongoose");
const Product = require("./models/Product");

async function fixProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/yarika", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    // Update each product
    for (const product of products) {
      console.log(`\nChecking product ${product.code}:`, {
        name: product.name,
        currentStatus: product.status,
        currentTotalStock: product.totalStock,
        currentSizeStocks: Object.fromEntries(product.sizeStocks || new Map())
      });

      // Calculate total stock from sizeStocks
      const totalFromSizes = Array.from(product.sizeStocks.values()).reduce((sum, stock) => sum + (stock || 0), 0);
      
      // Check if totalStock needs updating
      if (product.totalStock !== totalFromSizes) {
        console.log(`Updating totalStock for ${product.code}:`, {
          oldTotal: product.totalStock,
          newTotal: totalFromSizes
        });
        product.totalStock = totalFromSizes;
      }

      // Determine correct status
      const correctStatus = product.totalStock > 0 ? 'active' : 'out-of-stock';
      if (product.status !== correctStatus && product.status !== 'discontinued') {
        console.log(`Updating status for ${product.code}:`, {
          oldStatus: product.status,
          newStatus: correctStatus,
          totalStock: product.totalStock
        });
        product.status = correctStatus;
      }

      // Save if changes were made
      if (product.isModified()) {
        await product.save();
        console.log(`Saved changes for ${product.code}`);
      } else {
        console.log(`No changes needed for ${product.code}`);
      }
    }

    console.log("\nFinished checking all products");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixProducts(); 