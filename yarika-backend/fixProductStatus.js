const mongoose = require("mongoose");
const Product = require("./models/Product");

async function fixProductStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/yarika", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    // Update each product's status based on totalStock
    for (const product of products) {
      const oldStatus = product.status;
      
      // Calculate total stock from sizeStocks
      if (product.sizeStocks && product.sizeStocks.size > 0) {
        const totalFromSizes = Array.from(product.sizeStocks.values()).reduce((sum, stock) => sum + stock, 0);
        product.totalStock = totalFromSizes;
      }

      // Update status based on totalStock
      if (product.status !== 'discontinued') {
        product.status = product.totalStock > 0 ? 'active' : 'out-of-stock';
      }

      // Save the product if status changed
      if (oldStatus !== product.status) {
        await product.save();
        console.log(`Updated product ${product.name} (${product.code}):`, {
          oldStatus,
          newStatus: product.status,
          totalStock: product.totalStock,
          sizeStocks: Object.fromEntries(product.sizeStocks)
        });
      }
    }

    console.log("Finished updating product statuses");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixProductStatus(); 