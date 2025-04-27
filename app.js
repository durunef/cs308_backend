require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// Veritabanı bağlantısı
require('./config/db');

// Middleware'ler
app.use(express.json());

// Auth rotaları
const authRouter = require('./routes/authRoutes');
app.use('/api/v1/auth', authRouter);

// Yeni user rotası
const userRouter = require('./routes/userRoutes');
app.use('/api/user', userRouter);

// Kategori ve ürün rotaları
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
// app.js içinde

// Sepet (Cart) rotaları
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

// Ana rota
app.get('/', (req, res) => {
  res.send('Hello from the server side');
});

// Sipariş (Order) rotaları
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Global hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error(err); // Hata yığınını (stack trace) konsola basıyoruz
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
  // Gerçek hata mesajını döndür, yoksa varsayılan
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

// App nesnesini dışa aktar
module.exports = app;
