const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');

// Get all products
router.get('/', productController.getProducts);

// Ürün ekleme: Yalnızca admin rolüne sahip kullanıcılar bu endpoint'i kullanabilir.
router.post('/', authMiddleware, restrictTo('admin'), productController.createProduct);

// Ürün inceleme (review) oluşturma ve listeleme: Tüm giriş yapmış kullanıcılar için.
router.post('/:id/reviews', authMiddleware, reviewController.createReview);
router.get('/:id/reviews', reviewController.getProductReviews);

router
  .route('/:id')
  .get(productController.getProductById);

module.exports = router;
