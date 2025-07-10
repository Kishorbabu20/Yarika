const mongoose = require("mongoose");
const Product = require("./models/Product");

async function updateAllProducts() {
  try {
    await mongoose.connect("mongodb://localhost:27017/yarika", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const products = await Product.find({});
    for (const product of products) {
      if (product.status !== 'discontinued') {
        product.status = product.totalStock > 0 ? 'active' : 'out-of-stock';
        await product.save();
        console.log(`Updated ${product.code}: status=${product.status}, totalStock=${product.totalStock}`);
      }
    }
    console.log("All products updated.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateAllProducts(); 