const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dotenv.config({ path: "../../configure.env" });

const DB_URL = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("🎉🎉Connected to DB"));

const tour_data = JSON.parse(fs.readFileSync("./tours.json", "utf-8"));
const user_data = JSON.parse(fs.readFileSync("./users.json", "utf-8"));
const review_data = JSON.parse(fs.readFileSync("./reviews.json", "utf-8"));

const file2Db = async () => {
  try {
    await Tour.create(tour_data);
    await User.create(user_data, { validateBeforeSave: false });
    await Review.create(review_data);
    console.log("DATA IMPORTED");
  } catch (err) {
    console.log("Error", err);
  }
  process.exit();
};

const emptyDB = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
  } catch (err) {
    console.log("Error", err);
  }
  process.exit();
};

if (process.argv[2] === "--Delete") {
  emptyDB();
  console.log("Data Deleted");
}

if (process.argv[2] === "--Import") {
  file2Db();
}
