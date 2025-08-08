const express = require('express');
const tourController = require('../controllers/tourController');
// const { getAllTours, getTour, newTour, updateTour, deleteTour } =
//   tourController;

const router = express.Router();

router.route('/').get(tourController.getAllTours).post(tourController.newTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
