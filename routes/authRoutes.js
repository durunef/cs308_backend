// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Test protected route
router.get('/Protected', authMiddleware, (req, res) => {
    res.json({
      message: 'You are authorized!',
      user: req.user  // req.user = decoded satırından gelen payload.
    });
 });

module.exports = router;
