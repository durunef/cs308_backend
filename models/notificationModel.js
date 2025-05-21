const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user']
    },
    title: {
      type: String,
      required: [true, 'Notification must have a title']
    },
    message: {
      type: String,
      required: [true, 'Notification must have a message']
    },
    type: {
      type: String,
      enum: ['discount', 'order', 'system'],
      default: 'system'
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 