const createNewError = require("../utils/createNewError");

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new createNewError(message, 400);
};

const handleDuplicateError = (err) => {
  // console.log("Dupli", err.keyValue.name);
  const message = `Duplicate value : ${err.keyValue.name} , please use another value`;
  return new createNewError(message, 400);
};

const handleValidationError = (err) => {
  // const errors = Object.values(err.errors)
  //   .map((i) => i.message)
  //   .join(",");

  // console.log(err.message);
  // const message = `Validation Error`;
  return new createNewError(err.message, 400);
};

const handleJWTTokenError = (err) =>
  new createNewError("Inavlid token please login again", 401);

const handleJWTExpiredError = (err) =>
  new createNewError("Your token Expired, please login again", 401);

const devError = (err, req, res) => {
  // console.log("DevError🤦‍♂️🤦‍♂️🤦‍♂️");
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render("error", {
      status: err.status,
      msg: err.message,
    });
  }
};

const prodError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational === true) {
      res.status(err.statusCode).json({
        status: err.status,

        message: err.message,
      });
    } else {
      res.status(500).json({
        status: "Error",
        message: err.message,
      });
    }
  } else {
    if (err.isOperational === true) {
      console.log(err);
      res.status(err.statusCode).render("error", {
        msg: err.message,
      });
    } else {
      res.status(500).render("error", {
        msg: "Something went wrong",
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    devError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // let errObj = Object.assign(err);

    let errObj = JSON.parse(JSON.stringify(err));
    // console.log("Error Object: ", errObj);
    errObj.message = err.message;

    if (errObj.name === "CastError") errObj = handleCastError(errObj);

    if (errObj.code === 11000) errObj = handleDuplicateError(errObj);

    if (errObj.name === "ValidationError")
      errObj = handleValidationError(errObj);

    if (errObj.name === "JsonWebTokenError")
      errObj = handleJWTTokenError(errObj);

    if (errObj.name === "TokenExpiredError")
      errObj = handleJWTExpiredError(errObj);
    prodError(err, req, res);
  }
};
