// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware'); // Eğer auth middleware ile korumak istiyorsanız

// Get all products
router.get('/', productController.getProducts);

// Ürün ekleme: authMiddleware kullanıyorsanız yalnızca giriş yapmış kullanıcı eklesin
router.post('/', authMiddleware, productController.createProduct);

router
  .route('/:id')
  .get(productController.getProductById);

module.exports = router;
