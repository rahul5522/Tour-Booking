const express = require("express");
const uc = require("../Controller/userController");
const ac = require("../Controller/authController");

const router = express.Router();

//To work with files

router.route("/signup").post(ac.signup);

router.route("/login").post(ac.login);

router.route("/logout").get(ac.logout);

router.route("/forgotpassword").post(ac.forgotPassword);

router.route("/resetpassword/:token").patch(ac.resetPassword);

//Adding this miidleware here to not repeat in all route that need protection after this line
router.use(ac.protect);

router.route("/updatepassword").patch(ac.updatePassword);

router
  .route("/updateme")
  .patch(uc.uploadUserPhoto, uc.resizeImage, uc.updateMe);

router.route("/deleteme").delete(uc.deleteMe);

router.route("/me").get(uc.getMe, uc.getUser);

//Router after this must be accessible by admin
router.use(ac.restrictTo("admin"));

router.route("/").get(uc.getAllUsers).post(uc.addUser);

router.route("/:id").get(uc.getUser).delete(uc.deleteUser).patch(uc.updateUser);

module.exports = router;
