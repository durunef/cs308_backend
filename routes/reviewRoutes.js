// routes/reviewRoutes.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
// Eğer varsa "restrictTo" gibi ek role kontrol middleware'i ekleyin
// const { restrictTo } = require('../middleware/authorization');

router.put('/:reviewId/approve', authMiddleware, /* restrictTo('product-manager'), */ reviewController.approveReview);

module.exports = router;
