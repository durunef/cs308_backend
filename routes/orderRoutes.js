// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');

// Sipariş oluşturma: login olmuş kullanıcı
router.post('/', authMiddleware, orderController.createOrder);

// Sipariş geçmişi: kendi siparişlerini görme
router.get('/', authMiddleware, orderController.getOrderHistory);



// Sadece admin ve delivery rollerine izin ver
router.patch('/:orderId/status',
    authMiddleware,
    restrictTo('admin', 'delivery'),
    orderController.updateOrderStatus
  );
  

module.exports = router;
