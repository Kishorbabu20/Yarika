const mongoose = require('mongoose');
const Wishlist = require('./models/Wishlist');

async function fixWishlistItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Yarika:qw12w2e3q1r4QWER_@cluster0.8ehwkwy.mongodb.net/yarika?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const wishlists = await Wishlist.find({});
    for (const wishlist of wishlists) {
      let updated = false;
      wishlist.items.forEach(item => {
        if (!item._id) {
          item._id = new mongoose.Types.ObjectId();
          updated = true;
        }
      });
      if (updated) {
        await wishlist.save();
        console.log(`Updated wishlist ${wishlist._id}`);
      }
    }
    console.log('Done!');
    process.exit();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

fixWishlistItems(); 