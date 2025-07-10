const mongoose = require('mongoose');
const Wishlist = require('./models/Wishlist');

async function addMissingItemIds() {
  // Update the connection string with your actual database name if needed
  await mongoose.connect('mongodb://localhost:27017/Yarika');

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
}

addMissingItemIds(); 