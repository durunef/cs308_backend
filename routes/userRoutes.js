// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Make the user by ID route public (no auth required)
router.get('/:userId', (req, res, next) => {
  // Bypass authMiddleware for this specific route
  userController.getUserById(req, res, next);
});

// Protect other routes with authentication
router.use(authMiddleware);

// Kullanıcı profil endpoint: GET /api/user/profile
router.get('/profile', userController.getProfile);

// Kullanıcı adres güncelleme: PUT /api/user/address
router.put('/address', userController.updateAddress);

// Utility route to check and fix address
router.get('/check-address', userController.checkAndFixAddress);

module.exports = router;
