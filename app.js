// app.js
const express = require('express');
const app = express();

// Veritabanı bağlantısı
require('./config/db');

// JSON verilerini parse et
app.use(express.json());

// Auth rotaları
const authRouter = require('./routes/authRoutes');
app.use('/api/v1/auth', authRouter);

// Basit ana rota
app.get('/', (req, res) => {
  res.send('Hello from the server side');
});

// (Opsiyonel) Global hata yakalama middleware'i
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

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
