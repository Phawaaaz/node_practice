const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middlewares
app.use(morgan('dev')); // Logging middleware for development
app.use(express.json());

app.use((req, res, next) => { 
  console.log('Hello from the middle ware ');
  next();
});

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

module.exports = app
