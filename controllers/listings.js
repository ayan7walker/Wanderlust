const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// node-fetch (for geocoding)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

/* ======================================================
   INDEX (SEARCH + CATEGORY + FALLBACK RANDOM)
====================================================== */
module.exports.index = async (req, res) => {
  const { search, category } = req.query;
  let filter = {};

  // 🔍 Search by location OR country
  if (search) {
    filter.$or = [
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  let allListings = [];

  // 🏷 CATEGORY FILTER
  if (category) {

    // 🔥 Trending → always random 10
    if (category === "Trending") {
      const count = await Listing.countDocuments();
      const random = Math.max(
        0,
        Math.floor(Math.random() * Math.max(count - 10, 1))
      );

      allListings = await Listing.find({})
        .skip(random)
        .limit(10);
    } 
    else {
      // 👉 Try exact category first
      allListings = await Listing.find({ ...filter, category });

      // ❗ If no listings → fallback random
      if (allListings.length === 0) {
        const count = await Listing.countDocuments();
        const random = Math.max(
          0,
          Math.floor(Math.random() * Math.max(count - 10, 1))
        );

        allListings = await Listing.find({})
          .skip(random)
          .limit(10);
      }
    }

  } 
  else {
    // Normal index load
    allListings = await Listing.find(filter).sort({ _id: -1 });
  }

  res.render("listings/index", { allListings });
};

/* ======================================================
   NEW FORM
====================================================== */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

/* ======================================================
   SHOW
====================================================== */
module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

/* ======================================================
   CREATE
====================================================== */
module.exports.createListings = async (req, res) => {
  let url, filename;

  if (req.file) {
    url = req.file.path;
    filename = req.file.filename;
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // 🌍 GEOCODING (OpenStreetMap)
  const location = req.body.listing.location;

  const geoURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    location
  )}`;

  const response = await fetch(geoURL, {
    headers: {
      "User-Agent": "Airbnb-Clone/1.0 (ayan@gmail.com)",
    },
  });

  const data = await response.json();

  if (!data.length) {
    throw new ExpressError("Invalid location provided", 400);
  }

  newListing.geometry = {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };

  if (url && filename) {
    newListing.image = { url, filename };
  }

  await newListing.save();

  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};

/* ======================================================
   EDIT FORM
====================================================== */
module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image?.url || "";
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
  });
};

/* ======================================================
   UPDATE
====================================================== */
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

/* ======================================================
   DELETE
====================================================== */
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};







