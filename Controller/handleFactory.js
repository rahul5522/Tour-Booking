const catchAsyncError = require("../utils/catchAsyncError");
const createNewError = require("../utils/createNewError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      return next(new createNewError("No document found with this ID", 404));
    }

    res.status(204).json({
      status: "Success",
      message: "Deleted succesfully",
    });
  });

exports.updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    const updatedDoc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      next(new createNewError("No Document found with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: updatedDoc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      result: "sucess",
      data: {
        dacument: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate("reviews");

    if (!doc) {
      return next(new createNewError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsyncError(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const FinalQuery = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .projection()
      .pagination();

    const docs = await FinalQuery.query;

    // console.log(tours);
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  });
