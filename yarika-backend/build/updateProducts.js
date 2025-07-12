const mongoose = require("mongoose");
const Product = require("./models/Product");

async function updateAllProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Yarika:qw12w2e3q1r4QWER_@cluster0.8ehwkwy.mongodb.net/yarika?retryWrites=true&w=majority&appName=Cluster0", {
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