const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
main()
.then(()=>{
console.log("connected to db")
})
.catch((err)=>{
console.log(err)
});

async function main(){
  await mongoose.connect(MONGO_URL)
}
const initDB = async () => {
  await Listing.deleteMany({});

  const initdata = initData.data.map((obj) => ({
    ...obj,
    owner: "6936f8b9bb357500872f0a00"
  }));

  await Listing.insertMany(initdata); // ✅ USE MODIFIED DATA

  console.log("data was initialised");
};

initDB();
