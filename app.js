const path = require("path");
const express = require("express");
// const fs = require('fs');
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const XSS = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const createNewError = require("./utils/createNewError");
const errorController = require("./Controller/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRouter");
const viewRouter = require("./routes/viewsRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//Middleware To access Static Files
app.use(express.static(path.join(__dirname, "public")));

//Inbuilt Global Middleware to read json body
app.use(express.json({ limit: "10kb" }));

//To get the ookies in request header from client browser
app.use(cookieParser());
app.use(express.urlencoded({ limit: "10kb" }));

//Third Party Global Middleware

//To Set HTTP security headers
app.use(helmet());

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//SANITIZE HTML INJECTION XSS
app.use(XSS());

//To prevent parameter Pollution {Parameter repeating in APi url}
app.use(hpp());

//Logging API request only in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Global 3rd Middleware to limit the Aceess

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too Many requests please try after one hour",
});

app.use("/api", limiter);

app.use(compression());

//Custom Middleware
app.use((req, res, next) => {
  console.log("Hi Custom middleware");
  // console.log("Headers:", req.headers.cookie);
  // console.log(req.cookies);
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routing

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getOneTour);

// app.post('/api/v1/tours', addTour);

// app.patch('/api/v1/tours', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

app.use("/", viewRouter);

app.use("/api/v1/tours", tourRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/reviews", reviewRouter);

app.use("/api/v1/booking", bookingRouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "failed",
  //   message: `Path not fpund ${req.originalUrl}`,
  // });

  // const err = new Error(`Path not fpund ${req.originalUrl}`);

  // err.statusCode = 404;
  // err.status = "failed";
  // next(err);

  next(new createNewError(`Path not fpund ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
