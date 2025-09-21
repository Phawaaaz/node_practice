const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const { getAllTours, getTour, newTour, updateTour, deleteTour } =
//   tourController;

const router = express.Router();

// router.param('id', tourController.checkID);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stat').get(tourController.getTourStats);
router.route('/Montly-plan/:year').get(tourController.getMonthlyPlan);

// Create a middleware to protect user from accessing route without being authenticated
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour) 
  .delete(tourController.deleteTour);

module.exports = router;
