const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const optionalAuth = require('../middleware/optionalAuth');

// Opsiyonel auth middleware kullanılıyor: 
// Eğer token varsa doğrulanır, yoksa guest olarak devam eder.
router.get('/', optionalAuth, cartController.getCart);
router.post('/add', optionalAuth, cartController.addItemToCart);
router.post('/update', optionalAuth, cartController.updateCartItem);
router.post('/remove', optionalAuth, cartController.removeItemFromCart);

module.exports = router;
