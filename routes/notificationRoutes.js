const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/restrictTo');

// Protect all routes
router.use(protect);

// Get user's notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Create notification (admin only)
router.post('/', restrictTo('admin'), notificationController.createNotification);

// Create bulk notifications (admin only)
router.post('/bulk', restrictTo('admin'), notificationController.createBulkNotifications);

module.exports = router; 