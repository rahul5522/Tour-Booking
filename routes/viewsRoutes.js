const express = require("express");
const vc = require("../Controller/viewsController");
const ac = require("../Controller/authController");
const bc = require("../Controller/bookingController");
const router = express.Router();

// router.use(ac.isLoogedIn);

router.get("/", bc.createBookingCheckout, ac.isLoogedIn, vc.getOverview);

router.get("/login", ac.isLoogedIn, vc.getLoginForm);

router.get("/signup", vc.getSignupForm);

router.get("/tour/:tourName", ac.isLoogedIn, vc.getTour);

router.get("/me", ac.protect, vc.getAccount);

router.post("/submit-user-data", ac.protect, vc.updateUser);

router.get("/myBooking", ac.protect, vc.getMyBooking);

module.exports = router;