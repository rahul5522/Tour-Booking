const mongoose = require("mongoose");
const Tour = require("../models/tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please Provide review"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "review must belong to Tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to User"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Creating index to ensure each user can give one review on each tour, not multiple reviews on same tour

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   console.log("IN Find ");
  //   this.populate({
  //     path: "tour",
  //     select: "name",
  //   });
  this.populate({
    path: "user",
    select: "name photo ",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log("Inside Average Calculator");
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);

  //Just doing console log not work we need to chnage field in tour model

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

//Re-calculating RatingsAverage after New review added
reviewSchema.post("save", function () {
  //Review.calcAverageRatings(this.tour) cant use Review model before declarartion To Access static methods we need model name
  this.constructor.calcAverageRatings(this.tour);
});

//Re-calculating RatingsAverage after New review Updated or Deleted
reviewSchema.post(/^findOneAnd/, async function (doc) {
  // console.log(doc.tour);

  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
