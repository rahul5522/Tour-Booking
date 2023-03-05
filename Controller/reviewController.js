const Review = require("../models/reviewModel");

const catchAsyncError = require("../utils/catchAsyncError");
const factory = require("../Controller/handleFactory");

exports.getAllReviews = factory.getAll(Review);

exports.setTourAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getReview = factory.getOne(Review);
exports.createNewReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
