// Core Import
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// Requirements
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
// Secrurity HTTP headers
app.use(helmet()); // Set security HTTP headers

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging middleware for development
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // Apply rate limiting to all /api routes

// Login specific rate limiter
const loginLimiter = rateLimit({
  max: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many login attempts from this IP, please try again in an hour!',
});
app.use('/api/v1/users/login', loginLimiter); // Apply rate limiting to login route only

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// serving static files
app.use(express.static(`${__dirname}/public`)); // Serve static files from the public directory

// Test middleware
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
