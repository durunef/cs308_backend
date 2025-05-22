// tests/controllers/reviewController.test.js

// Mock mongoose first
jest.mock('mongoose');

// Mock dependencies
jest.mock('../../models/reviewModel', () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

jest.mock('../../models/productModel', () => ({
  findById: jest.fn()
}));

jest.mock('../../models/orderModel', () => ({
  findOne: jest.fn()
}));

jest.mock('../../utils/catchAsync', () => {
  return (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
});

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
      body: {},
      params: {},
      user: {
        id: 'user123',
        _id: 'user123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });

  describe('getProductReviews', () => {
    beforeEach(() => {
      req.params.id = 'product123';
    });

    test('should get product reviews and hide unapproved comments', async () => {
      // Mock reviews data
      const mockReviews = [
        {
          _id: 'review1',
          product: 'product123',
          user: 'user1',
          rating: 8,
          comment: 'Great product!',
          approved: true,
          toObject: jest.fn().mockReturnValue({
            _id: 'review1',
            product: 'product123',
            user: 'user1',
            rating: 8,
            comment: 'Great product!',
            approved: true
          })
        },
        {
          _id: 'review2',
          product: 'product123',
          user: 'user2',
          rating: 6,
          comment: 'Pending review comment',
          approved: false,
          toObject: jest.fn().mockReturnValue({
            _id: 'review2',
            product: 'product123',
            user: 'user2',
            rating: 6,
            comment: 'Pending review comment',
            approved: false
          })
        },
        {
          _id: 'review3',
          product: 'product123',
          user: 'user3',
          rating: 9,
          comment: undefined, // No comment for this review
          approved: true,
          toObject: jest.fn().mockReturnValue({
            _id: 'review3',
            product: 'product123',
            user: 'user3',
            rating: 9,
            approved: true
          })
        }
      ];

      Review.find.mockResolvedValue(mockReviews);

      // Execute
      await reviewController.getProductReviews(req, res, next);

      // Assert
      expect(Review.find).toHaveBeenCalledWith({ product: 'product123' });
      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.status).toBe('success');
      expect(responseCall.data.reviews).toHaveLength(3);
      
      // Check that unapproved comment is hidden
      const unapprovedReview = responseCall.data.reviews.find(r => r._id === 'review2');
      expect(unapprovedReview.comment).toBe('');
      
      // Check that approved comment is visible
      const approvedReview = responseCall.data.reviews.find(r => r._id === 'review1');
      expect(approvedReview.comment).toBe('Great product!');
      
      // Check that review without comment doesn't break
      const noCommentReview = responseCall.data.reviews.find(r => r._id === 'review3');
      expect(noCommentReview).toBeDefined();
    });

    test('should return empty array when no reviews exist', async () => {
      Review.find.mockResolvedValue([]);

      // Execute
      await reviewController.getProductReviews(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { reviews: [] }
      });
    });


  });

  describe('approveReview', () => {
    beforeEach(() => {
      req.params.reviewId = 'review123';
    });

    test('should approve review successfully', async () => {
      // Mock approved review
      const mockReview = {
        _id: 'review123',
        product: 'product123',
        user: 'user123',
        rating: 8,
        comment: 'Great product!',
        approved: true
      };

      Review.findByIdAndUpdate.mockResolvedValue(mockReview);

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
        data: { review: mockReview }
      });
    });

    test('should return error when review not found', async () => {
      Review.findByIdAndUpdate.mockResolvedValue(null);

      // Execute
      await reviewController.approveReview(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Review not found'
      });
    });


  });

  describe('rejectReview', () => {
    beforeEach(() => {
      req.params.reviewId = 'review123';
    });

    test('should reject (delete) review successfully', async () => {
      // Mock deleted review
      const mockReview = {
        _id: 'review123',
        product: 'product123',
        user: 'user123',
        rating: 3,
        comment: 'Bad product'
      };

      Review.findByIdAndDelete.mockResolvedValue(mockReview);

      // Execute
      await reviewController.rejectReview(req, res, next);

      // Assert
      expect(Review.findByIdAndDelete).toHaveBeenCalledWith('review123');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    test('should return error when review not found for rejection', async () => {
      Review.findByIdAndDelete.mockResolvedValue(null);

      // Execute
      await reviewController.rejectReview(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Review not found'
      });
    });


  });

  describe('getPendingReviews', () => {
    test('should get pending reviews with populated data', async () => {
      // Mock pending reviews
      const mockPendingReviews = [
        {
          _id: 'review1',
          product: {
            _id: 'product1',
            name: 'Product 1',
            images: ['image1.jpg']
          },
          user: {
            _id: 'user1',
            name: 'User One',
            email: 'user1@example.com'
          },
          rating: 6,
          comment: 'Pending comment 1',
          approved: false
        },
        {
          _id: 'review2',
          product: {
            _id: 'product2',
            name: 'Product 2',
            images: ['image2.jpg']
          },
          user: {
            _id: 'user2',
            name: 'User Two',
            email: 'user2@example.com'
          },
          rating: 4,
          comment: 'Pending comment 2',
          approved: false
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      
      // Fix the chaining - first populate call returns the query, second returns data
      Review.find.mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery) // First populate call returns query
        .mockResolvedValueOnce(mockPendingReviews); // Second populate call returns data

      // Execute
      await reviewController.getPendingReviews(req, res, next);

      // Assert
      expect(Review.find).toHaveBeenCalledWith({
        comment: { $exists: true, $ne: '' },
        approved: false
      });
      expect(mockQuery.populate).toHaveBeenCalledWith('product', 'name images');
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name email');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { pendingReviews: mockPendingReviews }
      });
    });

    test('should return empty array when no pending reviews exist', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      
      Review.find.mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce([]);

      // Execute
      await reviewController.getPendingReviews(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { pendingReviews: [] }
      });
    });


  });

  describe('getAllReviews', () => {
    test('should get all reviews with populated data', async () => {
      const mockReviews = [
        {
          _id: 'review1',
          product: {
            _id: 'product1',
            name: 'Product 1'
          },
          user: {
            _id: 'user1',
            name: 'User One',
            email: 'user1@example.com'
          },
          rating: 8,
          comment: 'Great product!',
          approved: true
        },
        {
          _id: 'review2',
          product: {
            _id: 'product2',
            name: 'Product 2'
          },
          user: {
            _id: 'user2',
            name: 'User Two',
            email: 'user2@example.com'
          },
          rating: 6,
          comment: 'Average product',
          approved: false
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      
      Review.find.mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockReviews);

      // Execute
      await reviewController.getAllReviews(req, res, next);

      // Assert
      expect(Review.find).toHaveBeenCalledWith();
      expect(mockQuery.populate).toHaveBeenCalledWith('product', 'name');
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name email');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { reviews: mockReviews }
      });
    });

    test('should return empty array when no reviews exist', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      
      Review.find.mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce([]);

      // Execute
      await reviewController.getAllReviews(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: { reviews: [] }
      });
    });


  });
});