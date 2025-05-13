// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protect routes with authentication
router.use(protect);

// Specific routes first
// Kullanıcı profil endpoint: GET /api/user/profile
router.get('/profile', userController.getProfile);

// Kullanıcı adres güncelleme: PUT /api/user/address
router.put('/address', userController.updateAddress);

// Utility route to check and fix address
router.get('/check-address', userController.checkAndFixAddress);

// Parameterized route should come after specific routes
// Make the user by ID route public (no auth required)
router.get('/:userId', (req, res, next) => {
  // Remove authMiddleware for this specific route since it's already applied above
  userController.getUserById(req, res, next);
});

module.exports = router;
