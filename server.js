const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASEPASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful!');
  });


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`running on port: ${port}.....`);
});
