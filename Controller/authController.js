const User = require("../models/userModel");
const { promisify } = require("util");
const catchAsyncError = require("../utils/catchAsyncError");
const jwt = require("jsonwebtoken");
const createNewError = require("../utils/createNewError");
const Email = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (res, user, statusCode, data) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions["secure"] = true;

  res.cookie("JWT", token, cookieOptions);

  res.status(statusCode).json({
    status: "Success",
    token,
    message: data,
  });
};

exports.signup = catchAsyncError(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(newUser, url).sendWelcone();

  //Implementing default login when user signup
  createAndSendToken(res, newUser, 201, newUser);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new createNewError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");
  console.log(password);
  if (user) {
    const result = await user.comparePassword(password, user.password);
    console.log(result);

    if (result) {
      createAndSendToken(res, user, 200, "Successfully logged IN");
    } else {
      return next(new createNewError("Email or password is wrong 😡😡", 401));
    }
  } else {
    return next(
      new createNewError("Please provide valid email address 🤨🤨", 401)
    );
  }
});

exports.protect = catchAsyncError(async (req, res, next) => {
  // console.log(req.headers);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }

  // console.log(token);

  if (!token) {
    return next(new createNewError("Please login to get Access", 401));
  }

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);

  const user = await User.findById(decode.id);

  if (!user) {
    return next(new createNewError("User not found .Please register", 401));
  }

  const changed = user.passwordChangedCheck(decode.iat);

  if (changed) {
    return next(
      new createNewError("Password chnaged Please login again!!!", 401)
    );
  }

  //Finally grant access to get Tours data
  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoogedIn = async (req, res, next) => {
  // console.log(req.headers);
  try {
    if (req.cookies.JWT) {
      // console.log(token);

      const decode = await promisify(jwt.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET
      );
      console.log(decode);

      const user = await User.findById(decode.id);

      if (!user) {
        return next();
      }

      const changed = user.passwordChangedCheck(decode.iat);

      if (changed) {
        return next();
      }

      //Finally grant access to get Tours data
      res.locals.user = user;
      next();
    } else {
      next();
    }
  } catch (err) {
    return next();
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new createNewError(
          "You don't have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new createNewError("User not found !!!", 404));
  }

  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Sending the token to email for reset password with url

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetpassword/${resetToken}`;

  // const options = {
  //   email: user.email,
  //   subject: "Reset Password Link",
  //   message: `To reset the password click the link below:\n ${resetUrl} \nPlease ignore if you havent raise reset request`,
  // };

  try {
    // await sendMail(options);

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: "Success",
      message:
        "Mail sent to reset password : Reset in 10 mins or it will expire",
    });
  } catch (err) {
    //Reseting those values
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new createNewError(err.message, 500));
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new createNewError("Token expired: Pleease raise request again", 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createAndSendToken(res, user, 200, "Successfully Changed the password");
});

//Updating password for already loggedin user

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  //find by mail
  // const user = await User.findOne({ email: req.user.email }).select(
  //   "+password"
  // );

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new createNewError("User not found", 404));
  }

  const re = await user.comparePassword(
    req.body.currentPassword,
    user.password
  );

  if (!re) {
    return next(new createNewError(" currentPassword not matched", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  createAndSendToken(res, user, 200, "Successfully Updated the password");
});

exports.logout = (req, res) => {
  res.cookie("JWT", "dummy", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "Success" });
};
