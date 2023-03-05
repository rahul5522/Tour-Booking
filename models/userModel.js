const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const catchAsyncError = require("../utils/catchAsyncError");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
  },
  email: {
    type: String,
    required: [true, "Please provide Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide valid email"],
  },
  password: {
    type: String,
    required: [true, "Provide password"],
    minlength: [8, "Password is less than 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Provide Confirm password"],
    validate: {
      validator: function (item) {
        return item === this.password;
      },
      message: "Password not matching",
    },
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//Mongoose middleware to hash password before storing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  //Now we don need confirm password
  this.passwordConfirm = undefined;
  next();
});

//To change password chnaged at when password update
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  //Minus 1sec so that nw jwt token has more timestamp
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Middleware to not select in-acticve users

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

//We can attach methods to schema [Instance methods]

userSchema.methods.comparePassword = async function (
  enteredPassword,
  hashPassword
) {
  // console.log(enteredPassword, hashPassword);
  const re = await bcrypt.compare(enteredPassword, hashPassword);

  return re;
};

userSchema.methods.passwordChangedCheck = function (JWTTimestamp) {
  console.log(JWTTimestamp);
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log(resetToken, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
