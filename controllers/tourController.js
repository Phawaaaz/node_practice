const Tour = require('../models/tourModels');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'Sucess',
    // result: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1; // convert string to number

  // if (!tours) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }

  // res.status(200).json({
  //   status: 'Sucess',
  //   data: {
  //     tours,
  //   },
  // });
};

exports.createTour = async (req, res) => {
  try{

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  }
  catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
  //
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1; // convert string to number

  // Update the tour with the new data from the request body
  Object.assign(tours, req.body);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(200).json({
  //       status: 'success',
  //       data: {
  //         tour,
  //       },
  //     });
  //   }
  // );
};
exports.deleteTour = (req, res) => {
  console.log(req.params);

  res.status(204).json({
    status: 'success',
    data: {
      tours: null,
    },
  });
};
