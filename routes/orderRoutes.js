// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// Sipariş oluşturma (checkout)
router.post('/checkout', orderController.checkout);

// Kullanıcı sipariş geçmişi
router.get('/', orderController.getOrders);

// For compatibility with frontend calling /history
router.get('/history', orderController.getOrders);

// Sipariş durumu güncelleme (processing, in-transit, delivered)
router.patch('/:id/status', orderController.updateOrderStatus);

// Order cancellation and refund routes
router.post('/:orderId/cancel', orderController.cancelOrder);
router.post('/:orderId/refund', orderController.requestRefund);
router.get('/refund/:refundId', orderController.getRefundStatus);

module.exports = router;
