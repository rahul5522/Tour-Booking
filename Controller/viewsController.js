const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsyncError = require("../utils/catchAsyncError");
const createNewError = require("../utils/createNewError");
const User = require("../models/userModel");

exports.getOverview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();

  //   console.log(tours);
  res.status(200).render("overview", {
    title: `All tours`,
    tours,
  });
});

exports.getTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourName }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  // console.log(tour);

  if (!tour) {
    return next(new createNewError("No Tour found with this name", 404));
  }

  res.status(200).render("tour", {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Signup",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "My Profile",
  });
};

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const updated_user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: "My Profile",
    user: updated_user,
  });
});

exports.getMyBooking = catchAsyncError(async (req, res, next) => {
  const my_bookings = await Booking.find({ user: req.user.id });

  const tourids = my_bookings.map((i) => i.tour);

  const tours = await Tour.find({ _id: { $in: tourids } });

  res.status(200).render("overview", { title: "My Bookings", tours });
});
