const express = require("express");
const bc = require("../Controller/bookingController");
const ac = require("../Controller/authController");

const router = express.Router();

router.use(ac.protect);
//Adding Comment
router.get("/create-payment-session/:tourID", bc.createSession);

router.use(ac.restrictTo("admin", "lead-guide"));

router.route("/").post(bc.bookNewTour).get(bc.getAllBookings);

router
  .route("/:id")
  .get(bc.getOneBooking)
  .patch(bc.updateBooking)
  .delete(bc.deleteBooking);
module.exports = router;
