require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path'); 
const fs = require('fs');
const { protect }    = require('./middleware/authMiddleware');
const restrictTo     = require('./middleware/restrictTo');

// CORS middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Veritabanı bağlantısı
require('./config/db');

// Ensure directories exist
const uploadsPath = path.join(__dirname, 'public/uploads');
const imagesPath = path.join(__dirname, 'public/images');

// Create directories if they don't exist
[uploadsPath, imagesPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created directory:', dir);
  }
});

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Configure invoice serving with error handling
const invoicesPath = path.join(__dirname, 'invoices');

// Ensure invoices directory exists
if (!fs.existsSync(invoicesPath)) {
  fs.mkdirSync(invoicesPath, { recursive: true });
  console.log('Created invoices directory at:', invoicesPath);
}

app.use('/invoices', (req, res) => {
  const invoiceFile = path.join(invoicesPath, req.path);
  
  console.log('Invoice request received for:', req.path);
  console.log('Looking for file at:', invoiceFile);
  
  // Check if file exists
  fs.access(invoiceFile, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Invoice file not found:', err);
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found',
        path: invoiceFile
      });
    }

    // File exists, try to send it
    res.sendFile(invoiceFile, (err) => {
      if (err) {
        console.error('Error sending invoice file:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Error sending invoice file'
        });
      }
      console.log('Invoice file sent successfully:', req.path);
    });
  });
});

// Protected invoice route for sales managers
app.use(
  '/api/sales/invoices/files',
  protect,
  restrictTo('sales-manager'),
  (req, res) => {
    const invoiceFile = path.join(invoicesPath, req.path);
    console.log('Protected invoice request for:', req.path);
    console.log('Looking for file at:', invoiceFile);
    
    fs.access(invoiceFile, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Protected invoice file not found:', err);
        return res.status(404).json({
          status: 'error',
          message: 'Invoice not found',
          path: invoiceFile
        });
      }
      
      res.sendFile(invoiceFile, (err) => {
        if (err) {
          console.error('Error sending protected invoice file:', err);
          return res.status(500).json({
            status: 'error',
            message: 'Error sending invoice file'
          });
        }
        console.log('Protected invoice file sent successfully:', req.path);
      });
    });
  }
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
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/sales', salesRoutes);
app.use('/api/notifications', notificationRoutes);

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