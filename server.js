/* eslint-disable prettier/prettier */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err, err.name, err.message);
  console.log("UNCAUGHT EXCEPTION 🔴🔴🔴 Shutting down.....");
  process.exit(1);
});

dotenv.config({ path: "./configure.env" });
const app = require("./app");

const DB_URL = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose
  // .connect(process.env.LOCAL_DB, {
  .connect(DB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() => {
    // console.log(conn.connections);
    console.log("Connection Established");
  });

const port = process.env.PORT || 8000;

// console.log(process.env);

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

//Handling Error for promise rejetion like Database connection error , basically handling node errors not expess error
process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION 🔴🔴🔴 Shutting down.....");
  server.close(() => {
    process.exit(1);
  });
});
