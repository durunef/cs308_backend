// tests/controllers/reviewController.test.js

// Mock dependencies
jest.mock('../../models/reviewModel', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../../models/productModel', () => ({
  findById: jest.fn()
}));

jest.mock('../../models/orderModel', () => ({
  findOne: jest.fn()
}));

// Import controller after mocking dependencies
const reviewController = require('../../controllers/reviewController');
const Review = require('../../models/reviewModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');

describe('Review Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request, response and next function mocks
    req = {
      user: { id: 'user123' },
      params: { id: 'product123', reviewId: 'review123' },
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('createReview', () => {
    
  });

  describe('getProductReviews', () => {
    test('should get all reviews for a product and hide unapproved comments', async () => {
      // Setup request
      req.params.id = '68000cef3a0b4f8159733b1f'; // Product ID
      
      // Mock Review.find
      const mockReviews = [
        {
          _id: 'review123',
          product: '68000cef3a0b4f8159733b1f',
          user: 'user123',
          rating: 8,
          comment: 'Great coffee beans!',
          approved: true,
          toObject: () => ({
            _id: 'review123',
            product: '68000cef3a0b4f8159733b1f',
            user: 'user123',
            rating: 8,
            comment: 'Great coffee beans!',
            approved: true
          })
        },
        {
          _id: 'review456',
          product: '68000cef3a0b4f8159733b1f',
          user: 'user456',
          rating: 5,
          comment: 'Average taste, not worth the price.',
          approved: false,
          toObject: () => ({
            _id: 'review456',
            product: '68000cef3a0b4f8159733b1f',
            user: 'user456',
            rating: 5,
            comment: 'Average taste, not worth the price.',
            approved: false
          })
        }
      ];
      Review.find.mockResolvedValue(mockReviews);

      // Execute
      await reviewController.getProductReviews(req, res, next);

      // Assert
      expect(Review.find).toHaveBeenCalledWith({ product: '68000cef3a0b4f8159733b1f' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          reviews: expect.arrayContaining([
            expect.objectContaining({
              _id: 'review123',
              rating: 8,
              comment: 'Great coffee beans!',
              approved: true
            }),
            expect.objectContaining({
              _id: 'review456',
              rating: 5,
              comment: '', // Comment hidden because not approved
              approved: false
            })
          ])
        }
      });
    });
  });

  describe('approveReview', () => {
    test('should approve a review', async () => {
      // Setup request
      req.params.reviewId = 'review123';
      
      // Mock Review.findByIdAndUpdate
      const mockUpdatedReview = {
        _id: 'review123',
        product: '68000cef3a0b4f8159733b1f',
        user: 'user123',
        rating: 8,
        comment: 'Great coffee beans!',
        approved: true
      };
      Review.findByIdAndUpdate.mockResolvedValue(mockUpdatedReview);

      // Execute
      await reviewController.approveReview(req, res, next);

      // Assert
      expect(Review.findByIdAndUpdate).toHaveBeenCalledWith(
        'review123',
        { approved: true },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          review: mockUpdatedReview
        }
      });
    });

    test('should return 404 if review not found', async () => {
      // Setup request
      req.params.reviewId = 'nonexistentReview';
      
      // Mock Review.findByIdAndUpdate to return null (review not found)
      Review.findByIdAndUpdate.mockResolvedValue(null);

      // Execute
      await reviewController.approveReview(req, res, next);

      // Assert
      expect(Review.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistentReview',
        { approved: true },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Review not found'
      });
    });
  });
});