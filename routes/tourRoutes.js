const express = require("express");
const tc = require("../Controller/tourController");
const ac = require("../Controller/authController");
const rc = require("../Controller/reviewController");
const reviewRouter = require("../routes/reviewRouter");

const router = express.Router();

router.param("id", (req, res, next, val) => {
  console.log(val);
  next();
});

router.route("/getTourStats").get(tc.getTourStats);

router
  .route("/getBusyMonth/:year")
  .get(
    ac.protect,
    ac.restrictTo("admin", "guide", "lead-guide"),
    tc.getBusyMonth
  );

router.route("/top-5-tours").get(tc.aliasTopTour, tc.getAllTours);

router
  .route("/")
  .get(tc.getAllTours)
  .post(ac.protect, ac.restrictTo("admin", "lead-guide"), tc.addTour);

router
  .route("/:id")
  .get(tc.getOneTour)
  .delete(ac.protect, ac.restrictTo("admin", "lead-guide"), tc.deleteTour)
  .patch(
    ac.protect,
    ac.restrictTo("admin", "lead-guide"),
    tc.uploadTourImages,
    tc.resizeImages,
    tc.updateTour
  );

router
  .route("/tours-within/:distance/center/:latlag/unit/:unit")
  .get(tc.getToursWithin);

router.route("/distances/:latlag/unit/:unit").get(tc.getDistances);
//NEsted Routing
//Option1
// router
//   .route("/:tourId/reviews")
//   .post(ac.protect, ac.restrictTo("user"), rc.createNewReview);

//Option:2
router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
