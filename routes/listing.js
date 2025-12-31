const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

/* =========================================================
   INDEX (search + category filter)  &  CREATE LISTING
   ========================================================= */

router
  .route("/")
  // 🔍 SEARCH BY LOCATION & CATEGORY
  .get(wrapAsync(listingController.index))

  // ➕ CREATE NEW LISTING
  .post(
    isLoggedIn,
    upload.single("image"),
    wrapAsync(listingController.createListings)
  );

/* =========================================================
   NEW LISTING FORM
   ========================================================= */

router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);

/* =========================================================
   SHOW SINGLE LISTING
   ========================================================= */

router.get(
  "/:id",
  wrapAsync(listingController.showListing)
);

/* =========================================================
   EDIT LISTING FORM
   ========================================================= */

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

/* =========================================================
   UPDATE LISTING
   ========================================================= */

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

/* =========================================================
   DELETE LISTING
   ========================================================= */

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;




