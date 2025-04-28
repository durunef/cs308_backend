// tests/controllers/authController.test.js

// Mock dependencies
jest.mock('../../models/userModel', () => ({
  create: jest.fn(),
  findOne: jest.fn()
}));

jest.mock('../../models/cartModel', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token')
}));

// Import controller after mocking dependencies
const authController = require('../../controllers/authController');
const User = require('../../models/userModel');
const Cart = require('../../models/cartModel');
const jwt = require('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret';

    // Setup request, response and next function mocks
    req = {
      body: {},
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('signup', () => {
    test('should create a regular user with user role when domain is not admin or delivery', async () => {
      // Setup request
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      // Mock data
      const mockUser = {
        _id: 'user123',
        ...req.body,
        role: 'user'
      };
      User.create.mockResolvedValue(mockUser);

      // Execute
      await authController.signup(req, res, next);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'user'
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123', email: 'test@example.com', role: 'user' },
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: { user: mockUser },
        token: 'test-token'
      }));
    });

    test('should create admin user when email domain is admin.com', async () => {
      // Setup request
      req.body = {
        name: 'Admin User',
        email: 'admin@admin.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      // Mock data
      const mockUser = {
        _id: 'admin123',
        ...req.body,
        role: 'admin'
      };
      User.create.mockResolvedValue(mockUser);

      // Execute
      await authController.signup(req, res, next);

      // Assert
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Admin User',
        email: 'admin@admin.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'admin'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0].data.user.role).toBe('admin');
    });

    test('should create delivery user when email domain is delivery.com', async () => {
      // Setup request
      req.body = {
        name: 'Delivery User',
        email: 'staff@delivery.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      // Mock data
      const mockUser = {
        _id: 'delivery123',
        ...req.body,
        role: 'delivery'
      };
      User.create.mockResolvedValue(mockUser);

      // Execute
      await authController.signup(req, res, next);

      // Assert
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Delivery User',
        email: 'staff@delivery.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'delivery'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0].data.user.role).toBe('delivery');
    });
  });

  describe('login', () => {
    test('should login user with correct credentials', async () => {
      // Setup request
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Mock data
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
        address: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001'
        }
      };
      User.findOne.mockResolvedValue(mockUser);

      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123', email: 'test@example.com', role: 'user' },
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        message: 'Logged in successfully',
        token: 'test-token',
        data: expect.any(Object)
      }));
    });

    test('should return 400 if email or password is not provided', async () => {
      // Setup request with missing password
      req.body = {
        email: 'test@example.com'
      };
      
      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Please provide email and password!'
      });
    });

    test('should return 401 if credentials are incorrect', async () => {
      // Setup request
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      // Mock data - user found but password doesn't match
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'password123'
      };
      User.findOne.mockResolvedValue(mockUser);

      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    });
  });
});