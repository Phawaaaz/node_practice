const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: `${__dirname}/../../.env` });
const Tour = require('../../models/tourModels');

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

//   Read json file
const tours = JSON.parse(fs.readFileSync('tours-simple.json', 'utf-8'));

// Import data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// delete All data from database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.error(err);
  }
    process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please provide a valid argument: --import or --delete');
}
console.log(process.argv);
