require('dotenv').config();
const express = require('express');
const app = express();


// Veritabanı bağlantısı
require('./config/db');

// Middleware'ler
app.use(express.json());

// Auth rotaları
const authRouter = require('./routes/authRoutes');
app.use('/api/v1/auth', authRouter);


//yeni user rotası ekledim. User kısmı burda
const userRouter = require('./routes/userRoutes');
app.use('/api/user', userRouter);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);


const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);


// Ana rota
app.get('/', (req, res) => {
  res.send('Hello from the server side');
});

// Global hata yakalama middleware'i
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// **App nesnesini dışa aktar**
module.exports = app;


