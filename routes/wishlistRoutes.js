const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(wishlistController.getWishlist)
  .post(wishlistController.addToWishlist);

router
  .route('/:productId')
  .delete(wishlistController.removeFromWishlist)
  .patch(wishlistController.toggleDiscountNotification);

module.exports = router; 