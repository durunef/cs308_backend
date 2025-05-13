const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');
const upload = require('../middlewares/uploadMiddleware');

// Get all products
router.get('/', productController.getProducts);

// Ürün ekleme: Yalnızca admin rolüne sahip kullanıcılar bu endpoint'i kullanabilir.
router.post('/', 
  protect, 
  restrictTo('admin'), 
  upload.single('image'),
  productController.createProduct
);

// Ürün inceleme (review) oluşturma ve listeleme: Tüm giriş yapmış kullanıcılar için.
router.post('/:id/reviews', protect, reviewController.createReview);
router.get('/:id/reviews', reviewController.getProductReviews);

router
  .route('/:id')
  .get(productController.getProductById);

// Ürün listeleme, arama ve sıralama (GET)
router.get('/', productController.getProducts);

module.exports = router;
