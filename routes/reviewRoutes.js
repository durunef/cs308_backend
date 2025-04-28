const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');

// Yorum onaylama: Sadece admin rolüne sahip kullanıcılar erişebilsin.
router.put('/:reviewId/approve', authMiddleware, restrictTo('admin'), reviewController.approveReview);

// Get pending reviews for approval
router.get('/pending', authMiddleware, reviewController.getPendingReviews);

module.exports = router;
