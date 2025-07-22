const mongoose = require("mongoose");
const Product = require("./models/Product");

async function migrateStockFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Yarika:qw12w2e3q1r4QWER_@cluster0.8ehwkwy.mongodb.net/yarika?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    // Update each product
    for (const product of products) {
      console.log(`\nChecking product ${product.code}:`, {
        name: product.name,
        oldStock: product.stock,
        oldStockBySize: product.stockBySize,
        currentTotalStock: product.totalStock,
        currentSizeStocks: product.sizeStocks
      });

      // Convert old fields to new schema
      if (product.stockBySize && !product.sizeStocks) {
        // Convert stockBySize to sizeStocks
        product.sizeStocks = new Map(Object.entries(product.stockBySize));
        
        // Calculate totalStock from sizeStocks
        const totalFromSizes = Array.from(product.sizeStocks.values()).reduce((sum, stock) => sum + (stock || 0), 0);
        product.totalStock = totalFromSizes;

        // Remove old fields
        product.stock = undefined;
        product.stockBySize = undefined;

        console.log(`Migrating stock fields for ${product.code}:`, {
          oldStock: product.stock,
          oldStockBySize: product.stockBySize,
          newTotalStock: product.totalStock,
          newSizeStocks: Object.fromEntries(product.sizeStocks)
        });

        // Update status based on new totalStock
        if (product.status !== 'discontinued') {
          product.status = product.totalStock > 0 ? 'active' : 'out-of-stock';
        }

        // Save changes
        await product.save();
        console.log(`Migrated and saved changes for ${product.code}`);
      } else {
        console.log(`No migration needed for ${product.code}`);
      }
    }

    console.log("\nFinished migrating all products");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

migrateStockFields(); 