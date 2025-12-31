const mongoose = require("mongoose");
const Listing = require("../models/listing");

// 🔌 DB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error", err));

async function fixOldListings() {
  try {
    const result = await Listing.updateMany(
      { category: { $exists: false } },
      { $set: { category: "Rooms" } }
    );

    console.log("✅ Old listings updated successfully");
    console.log(result);
  } catch (err) {
    console.error("❌ Error updating listings:", err);
  } finally {
    mongoose.connection.close();
  }
}

fixOldListings();
