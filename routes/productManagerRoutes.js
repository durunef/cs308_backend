const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictToProductManager } = require('../middleware/productManagerAuth');
const productController = require('../controllers/productController');
const upload = require('../middlewares/uploadMiddleware');
const categoryController = require('../controllers/categoryController');
const reviewController = require('../controllers/reviewController');
const orderController = require('../controllers/orderController');

// Protect all routes and restrict to product managers
router.use(protect);
router.use(restrictToProductManager);

// Dashboard endpoint
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Welcome to Product Manager Dashboard',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

// Product Management Routes
router
  .route('/products')
  .get(productController.getProducts)
  .post(upload.single('image'), productController.createProduct);


router.route('/products/:id')
  .get(productController.getProductById)  // Tek ürün detayı
  .patch(upload.single('image'), productController.updateProduct)  // Ürün güncelle
  .delete(productController.deleteProduct);  // Ürün sil

// Stok güncelleme endpoint'i
router.patch('/products/:id/stock', productController.updateStock);

// Kategori Yönetimi
router.route('/categories')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router.route('/categories/:id')
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router; 

// Yorum Yönetimi
router.get('/reviews', reviewController.getAllReviews);
router.patch('/reviews/:reviewId/approve', reviewController.approveReview);
router.patch('/reviews/:reviewId/reject', reviewController.rejectReview);

router.get('/invoices', orderController.getAllOrders);
router.get('/deliveries', orderController.getAllDeliveries);

router.patch(
  '/deliveries/:id',
  orderController.updateOrderStatus
);