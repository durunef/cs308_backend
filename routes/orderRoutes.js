// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware  = require('../middleware/authMiddleware');

// Tüm order rotaları için auth middleware devrede
router.use(authMiddleware);

// Sipariş oluşturma (checkout)
router.post('/checkout', orderController.checkout);

// Kullanıcı sipariş geçmişi
router.get('/', orderController.getOrders);

// For compatibility with frontend calling /history
router.get('/history', orderController.getOrders);

// Sipariş durumu güncelleme (processing, in-transit, delivered)
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
