// Core Import
const express = require('express');
const morgan = require('morgan');

// Requirements
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging middleware for development
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // Serve static files from the public directory

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.header);
  next();
});

// Routes Handlers
app.get('/', (req, res) => {
  res
    .status(200) // ✅ Changed from 400 to 200 (success status)
    .json({ message: 'Hello from the server side!', app: 'Natours' });
});

// Routes - Mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle unmatched routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // ✅ Fixed: AppError with uppercase
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
