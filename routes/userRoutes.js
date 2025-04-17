// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/user/profile
router.get('/profile', authMiddleware, userController.getProfile);

// PUT /api/user/address
router.put('/address', authMiddleware, userController.updateAddress);

module.exports = router;
