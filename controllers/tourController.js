const Tour = require('../models/tourModels');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.alaisTopTours = (req, res, next) => {
  req.Query.limit = '5';
  req.Query.sort = '-ratingsAverage, Price';
  req.Query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Build query
    // 1) Filtering
    const queryObj = { ...req.query };
    console.log(req.query, queryObj);

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    let Query = Tour.find(JSON.parse(queryStr));

    // 3) Sorting
    if (req.Query.sort) {
      const sortBy = req.Query.sort.split(',').join(' ');
      Query = Query.sort(sortBy);
    } else {
      Query = Query.sort('-createdAt');
    }
    // 4) Limiting
    if (req.Query.fields) {
      const fields = req.Query.fields.split(',').join('');
      Query = Query.select(fields);
    } else {
      Query = Query.select('-__v');
    }

    //5)  Pagination
    const page = req.Query.page * 1 || 1;
    const limit = req.Query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    Query = Query.skip(skip).limit(limit);

    if (req.Query.page) {
      const numTours = await Tour.countDocument();
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    // Execute the query
    const Tours = await Query;

    // Send response
    res.status(200).json({
      status: 'success',
      result: Tours.length,
      data: {
        tour: Tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //tour.findone({ _id: req.params.id });
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    const mongoose = require('mongoose');

    const tourSchema = new mongoose.Schema({
      // ...existing code...

      difficulty: {
        type: String, // Changed from Number to String
        required: [true, 'A tour must have a difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'Difficulty is either: easy, medium, difficult',
        },
      },

      summary: {
        // Changed from Summary to summary (case sensitive)
        type: String,
        trim: true,
        required: [true, 'A tour must have a description'],
      },

      // ...existing code...
    });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
