// tests/controllers/categoryController.test.js

// Mock dependencies
jest.mock('../../models/categoryModel', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

// Import controller after mocking dependencies
const categoryController = require('../../controllers/categoryController');
const Category = require('../../models/categoryModel');

describe('Category Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request, response and next function mocks
    req = {
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('createCategory', () => {
    test('should create a new category', async () => {
      // Setup request
      req.body = {
        name: 'Coffee Beans',
        description: 'Various types of coffee beans'
      };
      
      // Mock data
      const mockCategory = {
        _id: '67febefa24a0a851f38ba243',
        name: 'Coffee Beans',
        description: 'Various types of coffee beans'
      };
      Category.create.mockResolvedValue(mockCategory);

      // Execute
      await categoryController.createCategory(req, res, next);

      // Assert
      expect(Category.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { category: mockCategory }
      });
    });
  });

  describe('getAllCategories', () => {
    test('should get all categories', async () => {
      // Mock data
      const mockCategories = [
        {
          _id: '67febefa24a0a851f38ba243',
          name: 'Coffee Beans',
          description: 'Various types of coffee beans'
        },
        {
          _id: 'category456',
          name: 'Coffee Equipment',
          description: 'Coffee makers, grinders, and other equipment'
        }
      ];
      Category.find.mockResolvedValue(mockCategories);

      // Execute
      await categoryController.getAllCategories(req, res, next);

      // Assert
      expect(Category.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { categories: mockCategories }
      });
    });
  });

  describe('getProductsByCategory', () => {
    test('should get products for a specific category', async () => {
      // Setup request
      req.params.id = '67febefa24a0a851f38ba243';
      
      // Mock data
      const mockCategoryWithProducts = {
        _id: '67febefa24a0a851f38ba243',
        name: 'Coffee Beans',
        description: 'Various types of coffee beans',
        products: [
          {
            _id: '68000cef3a0b4f8159733b1f',
            name: 'Arabica Coffee Beans',
            description: 'Smooth and flavorful Arabica beans from Ethiopia.',
            price: 15.99
          },
          {
            _id: 'product456',
            name: 'Robusta Coffee Beans',
            description: 'Strong and bold Robusta coffee beans.',
            price: 12.99
          }
        ]
      };
      Category.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCategoryWithProducts)
      });

      // Execute
      await categoryController.getProductsByCategory(req, res, next);

      // Assert
      expect(Category.findById).toHaveBeenCalledWith('67febefa24a0a851f38ba243');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          category: 'Coffee Beans',
          description: 'Various types of coffee beans',
          products: mockCategoryWithProducts.products
        }
      });
    });

    test('should return 404 if category not found', async () => {
      // Setup request
      req.params.id = 'nonexistentCategory';
      
      // Mock data
      Category.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Execute
      await categoryController.getProductsByCategory(req, res, next);

      // Assert
      expect(Category.findById).toHaveBeenCalledWith('nonexistentCategory');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Category not found'
      });
    });
  });
});