// config/db.js
const mongoose = require('mongoose');

const DB_URL = 'mongodb://127.0.0.1:27017/ecommerce'; // veya istediğin DB adı

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB bağlantısı başarılı!');
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
  });

module.exports = mongoose;
