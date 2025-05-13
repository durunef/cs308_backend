// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Test protected route
router.get('/protected', protect, (req, res) => {
  res.json({
    status: 'success',
    message: 'You are authorized!',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
