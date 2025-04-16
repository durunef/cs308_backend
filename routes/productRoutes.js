// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');

const authMiddleware = require('../middleware/authMiddleware'); // Eğer auth middleware ile korumak istiyorsanız

// Ürün ekleme: authMiddleware kullanıyorsanız yalnızca giriş yapmış kullanıcı eklesin
router.post('/', authMiddleware, productController.createProduct);

router.post('/:id/reviews', authMiddleware, reviewController.createReview);
router.get('/:id/reviews', reviewController.getProductReviews);

module.exports = router;

