// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm rotaları auth ile koruyacağız
router.use(authMiddleware);

// Kullanıcı profil endpoint: GET /api/user/profile
router.get('/profile', userController.getProfile);

// Kullanıcı adres güncelleme: PUT /api/user/address
router.put('/address', userController.updateAddress);

// Utility route to check and fix address
router.get('/check-address', userController.checkAndFixAddress);

module.exports = router;
