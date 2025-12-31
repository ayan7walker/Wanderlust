const mongoose = require("mongoose");
const Listing = require("../models/listing");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust"); 
// ⬆️ DB name CONFIRM: wanderlust

async function geocodeOldListings() {
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.lat": { $exists: false } },
      { "geometry.lng": { $exists: false } },
    ],
  });

  console.log("Found old listings:", listings.length);

  for (let listing of listings) {
    if (!listing.location) continue;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      listing.location
    )}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Airbnb-Clone/1.0 (ayan@gmail.com)",
      },
    });

    const data = await res.json();
    if (!data.length) continue;

    listing.geometry = {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };

    await listing.save();
    console.log("✅ Geocoded:", listing.title);
  }

  console.log("🎉 DONE: All old listings updated");
  mongoose.connection.close();
}

geocodeOldListings();

