const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get user's notifications
exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    status: 'success',
    notifications
  });
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.notificationId,
      userId: req.user._id
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Delete notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  console.log('Delete notification - Request params:', req.params);
  console.log('Delete notification - User ID:', req.user._id);

  const notification = await Notification.findOneAndDelete({
    _id: req.params.notificationId,
    userId: req.user._id
  });

  console.log('Delete notification - Found notification:', notification);

  if (!notification) {
    return next(new AppError('Notification not found or you do not have permission to delete it', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

// Create a new notification
exports.createNotification = catchAsync(async (req, res, next) => {
  const { userId, title, message, type, link } = req.body;

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    link
  });

  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Create notifications for multiple users
exports.createBulkNotifications = catchAsync(async (req, res, next) => {
  const { userIds, title, message, type, link } = req.body;

  const notifications = await Promise.all(
    userIds.map(userId =>
      Notification.create({
        userId,
        title,
        message,
        type,
        link
      })
    )
  );

  res.status(201).json({
    status: 'success',
    data: {
      notifications
    }
  });
}); 