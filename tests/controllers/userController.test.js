// tests/controllers/userController.test.js

// Mock the dependencies at the top of the file
jest.mock('../../models/userModel', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('validator', () => ({
  isPostalCode: jest.fn()
}));

// Mock console.log to prevent noise in test output
console.log = jest.fn();

// Import the controller after mocking dependencies
const userController = require('../../controllers/userController');
const User = require('../../models/userModel');
const validator = require('validator');

describe('User Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    req = {
      user: { id: 'user123' },
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  describe('getProfile', () => {
    test('should get user profile', async () => {
      // Mock the response from User.findById
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        photo: 'default.jpg',
        address: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001'
        }
      };
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      // Call the controller method
      await userController.getProfile(req, res, next);
      
      // Make assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: {
          user: expect.objectContaining({
            id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            photo: 'default.jpg'
          })
        }
      }));
    });

    test('should return 404 if user not found', async () => {
      // Mock user not found
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      
      // Call the controller method
      await userController.getProfile(req, res, next);
      
      // Make assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });
  });

  describe('updateAddress', () => {
    test('should update user address', async () => {
      // Setup request
      req.body = {
        street: '456 Park Ave',
        city: 'New York',
        postalCode: '10002'
      };
      
      // Mock validator.isPostalCode to return true
      validator.isPostalCode.mockReturnValue(true);
      
      // Mock User.findByIdAndUpdate
      const mockUpdatedUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        address: {
          street: '456 Park Ave',
          city: 'New York',
          postalCode: '10002'
        }
      };
      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      // Call the controller method
      await userController.updateAddress(req, res, next);

      // Make assertions
      expect(validator.isPostalCode).toHaveBeenCalledWith('10002', 'any');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { address: { street: '456 Park Ave', city: 'New York', postalCode: '10002' } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: {
          user: mockUpdatedUser
        }
      }));
    });

    test('should return 400 if required address fields are missing', async () => {
      // Setup request with missing city
      req.body = {
        street: '456 Park Ave',
        postalCode: '10002'
      };

      // Call the controller method
      await userController.updateAddress(req, res, next);

      // Make assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Please share the street, city and postalCode informations.'
      });
    });

    test('should return 400 if postal code format is invalid', async () => {
      // Setup request
      req.body = {
        street: '456 Park Ave',
        city: 'New York',
        postalCode: 'invalid-format'
      };
      
      // Mock validator.isPostalCode to return false
      validator.isPostalCode.mockReturnValue(false);

      // Call the controller method
      await userController.updateAddress(req, res, next);

      // Make assertions
      expect(validator.isPostalCode).toHaveBeenCalledWith('invalid-format', 'any');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid postal code format.'
      });
    });
  });

  describe('checkAndFixAddress', () => {


    test('should return user data if address already exists', async () => {
      // Mock User.findById
      const mockUserWithAddress = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        address: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001'
        }
      };
      User.findById.mockResolvedValue(mockUserWithAddress);

      // Call the controller method
      await userController.checkAndFixAddress(req, res, next);

      // Make assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        message: 'Address checked and fixed if needed'
      }));
    });

    test('should return 404 if user not found', async () => {
      // Mock User.findById to return null (user not found)
      User.findById.mockResolvedValue(null);

      // Call the controller method
      await userController.checkAndFixAddress(req, res, next);

      // Make assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });
  });
});