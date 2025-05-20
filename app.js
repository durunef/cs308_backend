require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path'); 
const { protect }    = require('./middleware/authMiddleware');
const restrictTo     = require('./middleware/restrictTo');



// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both frontend ports
  credentials: true
}));


// Veritabanı bağlantısı
require('./config/db');

// Middleware'ler
app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// **YENİ** invoices PDF dosyalarına erişimi koruma
app.use(
  '/api/sales/invoices/files',
  protect,
  restrictTo('sales-manager'),
  express.static(path.join(__dirname, 'invoices'))
);

// Auth rotaları
const authRouter = require('./routes/authRoutes');
app.use('/api/v1/auth', authRouter);

// Yeni user rotası
const userRouter = require('./routes/userRoutes');
app.use('/api/user', userRouter);

// Kategori ve ürün rotaları
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);
// ——————————————————————————————————————————————————————————————
// Aşağıdaki satır eklendi, böylece frontend'imiz /api/v1/categories'den de kategori çekebilir:
app.use('/api/v1/categories', categoryRoutes);
// ——————————————————————————————————————————————————————————————

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const salesRoutes   = require('./routes/salesRoutes');
app.use('/api/sales', salesRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
// ——————————————————————————————————————————————————————————————
// Review rotalarını v1 endpoint'i olarak da ekleyelim
app.use('/api/v1/reviews', reviewRoutes);
// ——————————————————————————————————————————————————————————————

// Sepet (Cart) rotaları
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

// Wishlist rotaları
const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/v1/wishlist', wishlistRoutes);

app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
// Ana rota
app.get('/', (req, res) => {
  res.send('Hello from the server side');
});

// Sipariş (Order) rotaları
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Product Manager rotaları
const productManagerRoutes = require('./routes/productManagerRoutes');
app.use('/api/v1/product-manager', productManagerRoutes);

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