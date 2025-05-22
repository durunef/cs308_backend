// tests/controllers/notificationController.test.js

// Mock dependencies
jest.mock('../../models/notificationModel', () => ({
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  create: jest.fn()
}));

jest.mock('../../utils/catchAsync', () => {
  return (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
});

jest.mock('../../utils/appError');

// Import controller after mocking dependencies
const notificationController = require('../../controllers/notificationController');
const Notification = require('../../models/notificationModel');
const AppError = require('../../utils/appError');

describe('Notification Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request, response and next function mocks
    req = {
      body: {},
      params: {},
      user: {
        _id: 'user123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('getNotifications', () => {
    test('should get user notifications successfully', async () => {
      // Mock data
      const mockNotifications = [
        {
          _id: 'notif1',
          userId: 'user123',
          title: 'Test Notification 1',
          message: 'Test message 1',
          type: 'info',
          read: false,
          createdAt: new Date()
        },
        {
          _id: 'notif2',
          userId: 'user123',
          title: 'Test Notification 2',
          message: 'Test message 2',
          type: 'warning',
          read: true,
          createdAt: new Date()
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockNotifications)
      };

      Notification.find.mockReturnValue(mockQuery);

      // Execute
      await notificationController.getNotifications(req, res, next);

      // Assert
      expect(Notification.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        notifications: mockNotifications
      });
    });
  });

  describe('markAsRead', () => {
    test('should mark notification as read successfully', async () => {
      // Setup request
      req.params.notificationId = 'notif123';

      // Mock data
      const mockNotification = {
        _id: 'notif123',
        userId: 'user123',
        title: 'Test Notification',
        message: 'Test message',
        read: true
      };

      Notification.findOneAndUpdate.mockResolvedValue(mockNotification);

      // Execute
      await notificationController.markAsRead(req, res, next);

      // Assert
      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: 'notif123',
          userId: 'user123'
        },
        { read: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          notification: mockNotification
        }
      });
    });

    test('should return error if notification not found', async () => {
      // Setup request
      req.params.notificationId = 'nonexistent';

      // Mock findOneAndUpdate to return null
      Notification.findOneAndUpdate.mockResolvedValue(null);

      // Execute
      await notificationController.markAsRead(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('deleteNotification', () => {
    test('should delete notification successfully', async () => {
      // Setup request
      req.params.notificationId = 'notif123';

      // Mock data
      const mockNotification = {
        _id: 'notif123',
        userId: 'user123',
        title: 'Test Notification'
      };

      Notification.findOneAndDelete.mockResolvedValue(mockNotification);

      // Execute
      await notificationController.deleteNotification(req, res, next);

      // Assert
      expect(Notification.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'notif123',
        userId: 'user123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notification deleted successfully'
      });
    });

    test('should return error if notification not found or no permission', async () => {
      // Setup request
      req.params.notificationId = 'notif123';

      // Mock findOneAndDelete to return null
      Notification.findOneAndDelete.mockResolvedValue(null);

      // Execute
      await notificationController.deleteNotification(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('createNotification', () => {
    test('should create notification successfully', async () => {
      // Setup request
      req.body = {
        userId: 'user456',
        title: 'New Notification',
        message: 'This is a test notification',
        type: 'info',
        link: '/test-link'
      };

      // Mock data
      const mockNotification = {
        _id: 'notif123',
        ...req.body,
        createdAt: new Date(),
        read: false
      };

      Notification.create.mockResolvedValue(mockNotification);

      // Execute
      await notificationController.createNotification(req, res, next);

      // Assert
      expect(Notification.create).toHaveBeenCalledWith({
        userId: 'user456',
        title: 'New Notification',
        message: 'This is a test notification',
        type: 'info',
        link: '/test-link'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          notification: mockNotification
        }
      });
    });
  });
});