const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');

// Yorum onaylama: Sadece admin rolüne sahip kullanıcılar erişebilsin.
router.put('/:reviewId/approve', protect, restrictTo('admin'), reviewController.approveReview);

// Get pending reviews for approval
router.get('/pending', protect, reviewController.getPendingReviews);

module.exports = router;
