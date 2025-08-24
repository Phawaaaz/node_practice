// Core Import
const express = require('express');
const morgan = require('morgan');

// Requirement
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middlewares

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging middleware for development
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // Serve static files from the public directory

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ReadFile

//Routes Handlers
app.get('/', (req, res) => {
  res
    .status(400)
    .json({ message: 'Hello from the server side!', App: 'Natours' });
});

// Routes

//creating a new middleware for easy read and solveable routing sollution

//Mouting the router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.statusCode = 404;
  // err.status = 'fail'

  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
