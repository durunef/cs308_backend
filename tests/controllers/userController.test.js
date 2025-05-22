// tests/controllers/userController.test.js

// Mock mongoose first
jest.mock('mongoose');

// Mock dependencies
jest.mock('../../models/userModel', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../../models/orderModel', () => ({
  find: jest.fn()
}));

jest.mock('../../utils/catchAsync', () => {
  return (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
});

jest.mock('../../utils/appError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
    }
  };
});

jest.mock('validator', () => ({
  isPostalCode: jest.fn()
}));

// Import controller after mocking dependencies
const userController = require('../../controllers/userController');
const User = require('../../models/userModel');
const Order = require('../../models/orderModel');
const AppError = require('../../utils/appError');

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request, response and next function mocks
    req = {
      body: {},
      params: {},
      user: {
        id: 'user123',
        _id: 'user123',
        role: 'user'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();

    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    console.log.mockRestore();
  });

  describe('getProfile', () => {
    test('should get user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        photo: 'profile.jpg',
        address: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001'
        }
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findById.mockReturnValue(mockQuery);

      // Execute
      await userController.getProfile(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockQuery.select).toHaveBeenCalledWith('-password -passwordConfirm -__v');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            photo: 'profile.jpg',
            address: {
              street: '123 Main St',
              city: 'New York',
              postalCode: '10001'
            }
          }
        }
      });
    });

    test('should return error when user not found', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      User.findById.mockReturnValue(mockQuery);

      // Execute
      await userController.getProfile(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });


  });

  describe('updateAddress', () => {
    beforeEach(() => {
      req.body = {
        street: '456 Oak St',
        city: 'Los Angeles',
        postalCode: '90210'
      };
    });

    test('should update address successfully', async () => {
      const mockUpdatedUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '456 Oak St',
          city: 'Los Angeles',
          postalCode: '90210'
        }
      };

      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      // Execute
      await userController.updateAddress(req, res, next);

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { address: { street: '456 Oak St', city: 'Los Angeles', postalCode: '90210' } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: mockUpdatedUser
        }
      });
    });

    test('should return error when street is missing', async () => {
      req.body.street = '';

      // Execute
      await userController.updateAddress(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Please share the street, city and postalCode informations.'
      });
    });

    test('should return error when city is missing', async () => {
      req.body.city = '';

      // Execute
      await userController.updateAddress(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Please share the street, city and postalCode informations.'
      });
    });

    test('should return error when postalCode is missing', async () => {
      req.body.postalCode = '';

      // Execute
      await userController.updateAddress(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Please share the street, city and postalCode informations.'
      });
    });

    test('should return error when postalCode is too short', async () => {
      req.body.postalCode = '12';

      // Execute
      await userController.updateAddress(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid postal code format.'
      });
    });


  });

  describe('checkAndFixAddress', () => {
    test('should return user with existing address', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001'
        },
        save: jest.fn()
      };

      User.findById.mockResolvedValue(mockUser);

      // Execute
      await userController.checkAndFixAddress(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockUser.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Address checked and fixed if needed',
        data: {
          user: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            address: {
              street: '123 Main St',
              city: 'New York',
              postalCode: '10001'
            }
          }
        }
      });
    });

    test('should return error when user not found', async () => {
      User.findById.mockResolvedValue(null);

      // Execute
      await userController.checkAndFixAddress(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });


  });

  describe('getUserById', () => {
    beforeEach(() => {
      req.params.userId = 'user456';
    });

    test('should get user by ID successfully', async () => {
      const mockUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        photo: 'jane.jpg'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findById.mockReturnValue(mockQuery);

      // Execute
      await userController.getUserById(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('user456');
      expect(mockQuery.select).toHaveBeenCalledWith('name email photo -_id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          name: 'Jane Doe',
          photo: 'jane.jpg'
        }
      });
    });

    test('should return error when user not found', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      User.findById.mockReturnValue(mockQuery);

      // Execute
      await userController.getUserById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });


  });

  describe('getPurchasedProducts', () => {
    beforeEach(() => {
      req.params.userId = 'user123';
      req.user._id = 'user123';
    });

    test('should get purchased products successfully for own account', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          user: 'user123',
          status: 'delivered',
          createdAt: new Date('2024-01-01'),
          items: [
            {
              product: {
                _id: 'product1',
                name: 'Product 1',
                price: 100
              },
              priceAtPurchase: 100,
              quantity: 2
            }
          ]
        },
        {
          _id: 'order2',
          user: 'user123',
          status: 'delivered',
          createdAt: new Date('2024-01-15'),
          items: [
            {
              product: {
                _id: 'product2',
                name: 'Product 2',
                price: 50
              },
              priceAtPurchase: 45,
              quantity: 1
            }
          ]
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockOrders)
      };
      Order.find.mockReturnValue(mockQuery);

      // Execute
      await userController.getPurchasedProducts(req, res, next);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({
        user: 'user123',
        status: 'delivered'
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('items.product', 'name price image');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [
          {
            productId: 'product1',
            name: 'Product 1',
            price: 100,
            quantity: 2,
            purchaseDate: new Date('2024-01-01')
          },
          {
            productId: 'product2',
            name: 'Product 2',
            price: 45,
            quantity: 1,
            purchaseDate: new Date('2024-01-15')
          }
        ]
      });
    });

    test('should allow admin to view any user\'s purchase history', async () => {
      req.user._id = 'admin123';
      req.user.role = 'admin';
      req.params.userId = 'user456';

      const mockOrders = [];
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockOrders)
      };
      Order.find.mockReturnValue(mockQuery);

      // Execute
      await userController.getPurchasedProducts(req, res, next);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({
        user: 'user456',
        status: 'delivered'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: []
      });
    });

    test('should return authorization error when user tries to view another user\'s history', async () => {
      req.user._id = 'user123';
      req.params.userId = 'user456';

      // Execute
      await userController.getPurchasedProducts(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You are not authorized to view this user\'s purchase history',
          statusCode: 403
        })
      );
    });

    test('should return empty array when no purchased products exist', async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue([])
      };
      Order.find.mockReturnValue(mockQuery);

      // Execute
      await userController.getPurchasedProducts(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: []
      });
    });


  });
});