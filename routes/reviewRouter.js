const express = require("express");
const rc = require("../Controller/reviewController");
const ac = require("../Controller/authController");

//Added merge param for nested roting to get tour param value
const router = express.Router({ mergeParams: true });

//You need to login to see/update/... reviews
router.use(ac.protect);

router
  .route("/")
  .get(rc.getAllReviews)
  .post(ac.restrictTo("user"), rc.setTourAndUserId, rc.createNewReview);

router
  .route("/:id")
  .get(rc.getReview)
  .delete(ac.restrictTo("user", "admin"), rc.deleteReview)
  .patch(ac.restrictTo("user", "admin"), rc.updateReview);

module.exports = router;
