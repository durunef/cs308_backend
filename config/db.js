// config/db.js
const mongoose = require('mongoose');

const DB_URL = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecommerce';

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log('MongoDB connection is successful!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

module.exports = mongoose;
