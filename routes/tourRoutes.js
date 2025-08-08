const { Router } = require("express");

const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(newTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = Router