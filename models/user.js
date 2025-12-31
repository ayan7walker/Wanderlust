const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Node 22+ compatible import
let passportLocalMongoose;
try {
  passportLocalMongoose = require("passport-local-mongoose");
  
  // Check if it's wrapped in default or has .default property
  if (passportLocalMongoose.default) {
    passportLocalMongoose = passportLocalMongoose.default;
  }
  
  console.log("✅ passport-local-mongoose loaded:", typeof passportLocalMongoose);
} catch (err) {
  console.error("❌ Failed to load passport-local-mongoose:", err);
  throw err;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);


