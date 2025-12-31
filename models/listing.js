const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80";

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      url: String,
      filename: String,
    },

    price: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    // ✅ CATEGORY (FILTERS WILL WORK)
    category: {
      type: String,
      required: true,
      enum: [
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Castle",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic",
        "Dome",
        "Island",
      ],
    },

    geometry: {
      lat: Number,
      lng: Number,
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ⭐ IMAGE FALLBACK (INDEX + SHOW SAFE)
listingSchema.virtual("imageURL").get(function () {
  if (this.image && this.image.url) return this.image.url;
  return DEFAULT_IMG;
});

// 🗑 DELETE REVIEWS WHEN LISTING DELETED
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);


