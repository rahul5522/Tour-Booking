const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const createNewError = require("../utils/createNewError");
const factory = require("../Controller/handleFactory");
const multer = require("multer");
const sharp = require("sharp");

//To store file on disk
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//To Store file on buffer

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new createNewError("Only upload image files", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single("photo");

exports.resizeImage = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterBody = (body, ...select) => {
  for (let i in body) {
    if (!select.includes(i)) {
      delete body[i];
    }
  }
  return body;
};

exports.getAllUsers = factory.getAll(User);

exports.updateMe = catchAsyncError(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new createNewError("To update password use 'updatepassword' route", 400)
    );
  }

  //Dont upate Role
  const x = filterBody(req.body, "name", "email");

  if (req.file) x.photo = req.file.filename;

  const newUser = await User.findByIdAndUpdate(req.user.id, x, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    message: "Updated Successfully",
    newUser,
  });
});

//Not deleting from db just using active field to show results
exports.deleteMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "Success",
    data: null,
  });
});

exports.addUser = (req, res) => {
  res.status(500).json({
    status: "Internal Error",
    Message: "Please use signup to create reviews",
  });
};

//To get user own info

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateUser = factory.updateOne(User);

exports.getUser = factory.getOne(User);

exports.deleteUser = factory.deleteOne(User);
