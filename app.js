/* ================= ENV CONFIG ================= */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/* ================= CORE ================= */
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

/* ================= UTILS ================= */
const ExpressError = require("./utils/ExpressError");

/* ================= ROUTES ================= */
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

/* ================= SESSION & AUTH ================= */
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

/* ================= APP ================= */
const app = express();

/* ================= DATABASE ================= */
const dbUrl = process.env.ATLASDB_URL;

// ✅ DEPLOY-SAFE SESSION SECRET
const SESSION_SECRET =
  process.env.SECRET || "wanderlust_fallback_secret";

/* ================= DB CONNECT ================= */
mongoose
  .connect(dbUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ================= VIEW ENGINE ================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= MIDDLEWARE ================= */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

/* ================= SESSION STORE ================= */
const store = MongoStore.default.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: SESSION_SECRET,
  },
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", (err) => {
  console.error("❌ Session store error:", err);
});

/* ================= SESSION ================= */
app.use(
  session({
    store,
    name: "wanderlust",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

/* ================= PASSPORT ================= */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ================= GLOBAL LOCALS ================= */
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.showSearch =
    req.path !== "/login" && req.path !== "/signup";
  next();
});

/* ================= ROUTES ================= */
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

/* ================= 404 ================= */
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error.ejs", { err });
});

/* ================= SERVER (RENDER FIX) ================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});











