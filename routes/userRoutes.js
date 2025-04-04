// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// PUT /api/user/address
router.put('/address', authMiddleware, userController.updateAddress);

module.exports = router;
