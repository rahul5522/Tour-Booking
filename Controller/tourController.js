/* eslint-enable */
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const APIFeatures = require("../utils/apiFeatures");
const { findByIdAndDelete } = require("../models/tourModel");
const Tour = require("../models/tourModel");
const catchAsyncError = require("../utils/catchAsyncError");
const createNewError = require("../utils/createNewError");
const factory = require("../Controller/handleFactory");

//Earlier Working on a file instead of DB
// const tours_Data = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new createNewError("Only upload image files", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeImages = catchAsyncError(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  //Resizing Cover Image
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);

  req.body.imageCover = imageCoverFileName;

  //Resizing Tour images

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTour = (req, res, next) => {
  req.query.sort = "-ratingsAverage,price";
  req.query.limit = "5";
  req.query.fields = "name,price,ratingsAverage";
  // req.query.fields = 'name,raingsAverage,price';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsyncError(async (req, res, next) => {
//   //   console.log(req.requestTime);
//   // res.status(200).json({
//   //   status: 'sucess',
//   //   results: tours_Data.length,
//   //   data: { tour: tours_Data },
//   // });
//   // -----------------------------------------------------------------------------------MongoDB

//   const FinalQuery = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .projection()
//     .pagination();

//   const tours = await FinalQuery.query;

//   // console.log(tours);
//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: tours,
//   });

//   // try {
//   //Basic Filtering
//   // const copyQuery = { ...req.query };

//   // const excludeItems = ['page', 'sort', 'limit', 'fields'];

//   // excludeItems.forEach((i) => delete copyQuery[i]);

//   // //Advance Filtering to remove comparision operator
//   // let queryString = JSON.stringify(copyQuery);

//   // queryString = queryString.replace(
//   //   /\b(gt|lt|gte|lte)\b/g,
//   //   (item) => `$${item}`
//   // );

//   // console.log(req.query, JSON.parse(queryString));

//   // //Dont directly use await beause find method will return query object and we have to chain some methods on it

//   // let tempQuery = Tour.find(JSON.parse(queryString));

//   // if (req.query['sort']) {
//   //   const sortBy = req.query['sort'].split(',').join(' ');
//   //   // console.log(sortBy);
//   //   tempQuery = tempQuery.sort(sortBy);
//   // } else {
//   //   tempQuery = tempQuery.sort('-createdAt');
//   // }

//   // if (req.query.fields) {
//   //   const queryStr = req.query.fields.split(',').join(' ');
//   //   // console.log(querStr);
//   //   tempQuery = tempQuery.select(queryStr);
//   // } else {
//   //   tempQuery = tempQuery.select('-__v');
//   // }

//   //Pagination filtering

//   // const page = req.query.page * 1 || 1;
//   // const limit1 = req.query.limit * 1 || 100;
//   // const skip = limit1 * (page - 1);

//   // tempQuery = tempQuery.skip(skip).limit(limit1);

//   // if (req.query.page) {
//   //   const count = await Tour.countDocuments();

//   //   if (skip > count) {
//   //     throw new Error('The Page doesnt Exist');
//   //   }
//   // }

//   //   } catch (err) {
//   //     res.status(404).json({
//   //       status: "Failed",
//   //       messgae: err.message,
//   //     });
//   //   }
// });

exports.getOneTour = factory.getOne(Tour, "reviews");

// exports.getOneTour = catchAsyncError(async (req, res, next) => {
//   // if (Number(req.params.id) >= tours_Data.length - 1) {
//   //   res.status(404).json({
//   //     status: 'Failed',
//   //     data: { message: 'ID not found' },
//   //   });
//   // } else {
//   //   res.status(400).json({
//   //     status: 'sucess',
//   //     results: 1,
//   //     data: { tour: tours_Data[Number(req.params.id)] },
//   //   });
//   // }
//   // console.log(req.params);
//   // -----------------------------------------------------------------------------------MongoDB

//   const tour = await Tour.findById(req.params.id).populate("reviews");

//   if (!tour) {
//     return next(new createNewError("No Tour found with this ID", 404));
//   }

//   res.status(200).json({
//     status: "Success",
//     data: tour,
//   });

//   // try {
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: "Failed",
//   //     message: "Error while fetching",
//   //   });
//   // }
// });

// exports.checkBody = (req, res, next) => {
//   if (req.body['place']) {
//     console.log('Body', req.body);
//   } else {
//     res.status(400).json({
//       status: 'Failed',
//       message: 'Place not found please provide place',
//     });
//   }
//   next();
// };

exports.addTour = factory.createOne(Tour);

// exports.addTour = catchAsyncError(async (req, res, next) => {
//   // console.log(req.body);
//   // const newId = tours_Data[tours_Data.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body);
//   // tours_Data.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/../dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours_Data),
//   //   (err) => {
//   //     if (err) {
//   //       console.log('Failed to write 😢');
//   //       res.send('Failed to write 😢');
//   //     } else {
//   //       res.send('Done');
//   //     }
//   //   }
//   // );
//   // -----------------------------------------------------------------------------------MongoDB Implementation
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     result: "sucess",
//     data: {
//       Newtour: newTour,
//     },
//   });

//   //Try catch removed to handle those error at one place
//   // try {
//   //   //const tempTour = new Tour()
//   //   //tempTour.save({properites}).then()...

//   // } catch (err) {
//   //   // console.log('Error while inserting ', err);
//   //   res.status(400).json({
//   //     result: "Error",
//   //     message: err,
//   //   });
//   // }
// });
//Update Tour.........................

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsyncError(async (req, res, next) => {
//   const id = req.params.id;

//   // console.log(tours_data[id]);

//   // if (tours_Data[id]) {
//   //   for (let i of tours_Data) {
//   //     if (id === i.id) {
//   //       i.name = req.body['name'];
//   //       i.place = req.body['place'];
//   //     }
//   //   }

//   //   fs.writeFile(
//   //     `${__dirname}/../dev-data/data/tours-simple.json`,
//   //     JSON.stringify(tours_Data),
//   //     (err) => {
//   //       if (err) {
//   //         console.log('-------Failed to write file 😢');
//   //         res.send('Failed to write 😢');
//   //       } else {
//   //         res.send('Updated');
//   //       }
//   //     }
//   //   );
//   // } else {
//   //   res.send('ID not found');
//   // }
//   // -----------------------------------------------------------------------------------MongoDB
//   const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!updatedTour) {
//     next(new createNewError("No Tour found with this ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     updatedTour,
//   });

//   // try {
//   // } catch (err) {
//   //   // console.log('Error while updating', err);

//   //   res.status(404).json({
//   //     status: "failed",
//   //     message: err,
//   //   });
//   // }
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsyncError(async (req, res, next) => {
//   const id = req.params.id;

//   // console.log(id, tours_Data.length);

//   // let deleted = '';

//   // if (id <= tours_Data.length) {
//   //   for (let i in tours_Data) {
//   //     if (id === tours_Data[i].id) {
//   //       deleted = tours_Data.splice(i, 1);
//   //     }
//   //   }
//   //   console.log(tours_Data);
//   //   fs.writeFile(
//   //     `${__dirname}/../dev-data/data/tours-simple.json`,
//   //     JSON.stringify(tours_Data),
//   //     (err) => {
//   //       if (err) {
//   //         console.log('Failed to write file 😢');
//   //         res.send('Failed to write 😢');
//   //       } else {
//   //         res.status(404).json({
//   //           Deleted_item: deleted,
//   //         });
//   //       }
//   //     }
//   //   );
//   // } else {
//   //   res.send('ID not found');
//   // }
//   // ----------------------------------------------------------------------------------- MongoDb

//   const tour = await Tour.findByIdAndDelete(id);

//   if (!tour) {
//     return next(new createNewError("No Tour found with this ID", 404));
//   }

//   res.status(204).json({
//     status: "Success",
//     message: "Deleted succesfully",
//   });

//   // try {
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: "failed",
//   //     message: "Not able to delete",
//   //   });
//   // }
// });

//Below async function normally handled without central handler
exports.getTourStats = async (req, res) => {
  try {
    const stat = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },

      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTour: { $sum: 1 },

          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: stat,
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err.message,
    });
  }
};

exports.getBusyMonth = catchAsyncError(async (req, res, next) => {
  const year = req.params.year * 1;

  const busyMonth = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$startDates" },
        count: { $sum: 1 },
        name: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: busyMonth.length,
    data: busyMonth,
  });

  // try {
  // } catch (err) {
  //   res.status(404).json({
  //     status: "Failed",
  //     message: err.message,
  //   });
  // }
});

exports.getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlag, unit } = req.params;
  const [lat, lag] = latlag.split(",");

  //Geo operator uses radius and circle concept to discover  near tours
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lag) {
    return next(new createNewError("Please provide lat & lang ", 400));
  }

  console.log(distance, lat, lag, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lag, lat], radius] } },
  });

  res.status(200).json({
    status: "Success",
    results: tours.length,
    data: tours,
  });
});

exports.getDistances = catchAsyncError(async (req, res, next) => {
  const { latlag, unit } = req.params;
  const [lat, lag] = latlag.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lag) {
    return next(new createNewError("Please provide lat & lang ", 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lag * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "Success",
    results: distances.length,
    data: distances,
  });
});
