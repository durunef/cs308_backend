// tests/controllers/wishlistController.test.js

// Mock dependencies
jest.mock('../../models/wishlistModel', () => ({
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
  create: jest.fn()
}));

jest.mock('../../models/productModel', () => ({
  findById: jest.fn()
}));

jest.mock('../../utils/catchAsync', () => {
  return (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
});

jest.mock('../../utils/appError');

// Import controller after mocking dependencies
const wishlistController = require('../../controllers/wishlistController');
const Wishlist = require('../../models/wishlistModel');
const Product = require('../../models/productModel');
const AppError = require('../../utils/appError');

describe('Wishlist Controller', () => {
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
      },
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  describe('removeFromWishlist', () => {
    test('should remove product from wishlist successfully', async () => {
      // Setup request
      req.params.productId = 'product123';

      // Mock data
      const mockWishlistItem = {
        _id: 'wishlist123',
        userId: 'user123',
        productId: 'product123'
      };

      Wishlist.findOneAndDelete.mockResolvedValue(mockWishlistItem);

      // Execute
      await wishlistController.removeFromWishlist(req, res, next);

      // Assert
      expect(Wishlist.findOneAndDelete).toHaveBeenCalledWith({
        userId: 'user123',
        productId: 'product123'
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null
      });
    });

    test('should return error if product not found in wishlist', async () => {
      // Setup request
      req.params.productId = 'product123';

      Wishlist.findOneAndDelete.mockResolvedValue(null);

      // Execute
      await wishlistController.removeFromWishlist(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('getWishlist', () => {
    test('should get user wishlist successfully', async () => {
      // Mock data
      const mockWishlist = [
        {
          _id: 'wishlist1',
          userId: 'user123',
          productId: {
            _id: 'product1',
            name: 'Product 1',
            price: 100,
            discount: 20,
            discountedPrice: 80,
            image: 'image1.jpg',
            description: 'Description 1'
          },
          notifyOnDiscount: true
        },
        {
          _id: 'wishlist2',
          userId: 'user123',
          productId: {
            _id: 'product2',
            name: 'Product 2',
            price: 150,
            discount: 0,
            discountedPrice: 150,
            image: 'image2.jpg',
            description: 'Description 2'
          },
          notifyOnDiscount: false
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockWishlist)
      };

      Wishlist.find.mockReturnValue(mockQuery);

      // Execute
      await wishlistController.getWishlist(req, res, next);

      // Assert
      expect(Wishlist.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: 'productId',
        select: 'name price discount discountedPrice image description'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          wishlist: mockWishlist
        }
      });
    });

    test('should return empty wishlist', async () => {
      // Mock empty wishlist
      const mockQuery = {
        populate: jest.fn().mockResolvedValue([])
      };

      Wishlist.find.mockReturnValue(mockQuery);

      // Execute
      await wishlistController.getWishlist(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: {
          wishlist: []
        }
      });
    });
  });

  describe('toggleDiscountNotification', () => {
    test('should toggle discount notification to true successfully', async () => {
      // Setup request
      req.params.productId = 'product123';
      req.body = {
        notifyOnDiscount: true
      };

      // Mock data
      const mockWishlistItem = {
        _id: 'wishlist123',
        userId: 'user123',
        productId: 'product123',
        notifyOnDiscount: true
      };

      Wishlist.findOneAndUpdate.mockResolvedValue(mockWishlistItem);

      // Execute
      await wishlistController.toggleDiscountNotification(req, res, next);

      // Assert
      expect(Wishlist.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: 'user123',
          productId: 'product123'
        },
        { notifyOnDiscount: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          wishlistItem: mockWishlistItem
        }
      });
    });

    test('should toggle discount notification to false successfully', async () => {
      // Setup request
      req.params.productId = 'product123';
      req.body = {
        notifyOnDiscount: false
      };

      // Mock data
      const mockWishlistItem = {
        _id: 'wishlist123',
        userId: 'user123',
        productId: 'product123',
        notifyOnDiscount: false
      };

      Wishlist.findOneAndUpdate.mockResolvedValue(mockWishlistItem);

      // Execute
      await wishlistController.toggleDiscountNotification(req, res, next);

      // Assert
      expect(Wishlist.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: 'user123',
          productId: 'product123'
        },
        { notifyOnDiscount: false },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          wishlistItem: mockWishlistItem
        }
      });
    });

    test('should return error if product not found in wishlist', async () => {
      // Setup request
      req.params.productId = 'product123';
      req.body = {
        notifyOnDiscount: true
      };

      Wishlist.findOneAndUpdate.mockResolvedValue(null);

      // Execute
      await wishlistController.toggleDiscountNotification(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});

