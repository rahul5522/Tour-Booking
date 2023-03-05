const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (item) => Math.round(item * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount not be more than price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//Indexing for fast retrieval
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//Adding index for geoSpatial query
tourSchema.index({ startLocation: "2dsphere" });
//Temp field not going to store into DB
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//Virtual Populate : Child referencing without storing child references in array
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//Document Middleware : like express middleware , we also have mango db midleware using that to run betwwn action being dispatch and action being performed.
//For save and create action

tourSchema.pre("save", function (next) {
  // console.log("From Document middleware", this);

  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", async function (next) {
//   const promiseArray = this.guides.map(
//     async (item) => await User.findById(item)
//   );
//   this.guides = await Promise.all(promiseArray);
//   next();
// });
// tourSchema.post("save", function (doc, next) {
//   console.log("From DOC middleware");
//   console.log(doc);
//   next();
// });
//----------------------------------------------------------------------------
//Query middleware , modifies the query before executing
// tourSchema.pre("find", function (next) {
//   this.find({ secretTour: { $eq: false } });
//   next();
// });

// tourSchema.pre("findOne", function (next) {
//   this.find({ secretTour: false });
//   next();
// });

//Query middleware can be applied on diferent Query function s like find findOne findOneAndDelete findOneAndRemove findOneAndReplace findOneAndUpdate
//To generalize this middleware we can use regex

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $eq: false } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  const et = Date.now() - this.start;
  console.log("Excecution Time 🎉:" + et + "Miliseconds");
  // console.log(doc);
  next();
});

//--------------------------------------------------------------------------------------------------------
//Aggregator Middleware To Add mmath condition top of pipeline

// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: false } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;

// const tempTour = new Tour({
//   name: 'Rishikesh',
//   price: 6000,
// });

// tempTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log('Error', err));
