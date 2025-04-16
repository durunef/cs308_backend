const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');

// Yorum onaylama: Sadece admin rolüne sahip kullanıcılar erişebilsin.
router.put('/:reviewId/approve', authMiddleware, restrictTo('admin'), reviewController.approveReview);

module.exports = router;
