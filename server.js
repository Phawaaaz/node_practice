const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './.env' });
// console.log(app.get('env'));
// console.log(process.env); // This will log the current environment, e.g., 'development' or 'production'

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`running on port: ${port}.....`);
});
