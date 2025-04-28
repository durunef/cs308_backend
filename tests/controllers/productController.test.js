// tests/controllers/productController.test.js

// Mock dependencies
jest.mock('../../models/productModel', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

// Import controller after mocking dependencies
const productController = require('../../controllers/productController');
const Product = require('../../models/productModel');

describe('Product Controller', () => {
  let req, res, next;
  const mockProduct = {
    _id: '68000cef3a0b4f8159733b1f',
    name: 'Arabica Coffee Beans',
    model: 'AB-2024',
    serialNumber: 'SN0001233990',
    description: 'Smooth and flavorful Arabica beans from Ethiopia. Known for their swee...',
    quantityInStock: 0,
    price: 15.99,
    currency: 'USD',
    image: '/images/arabica.jpg',
    warrantyStatus: 'valid',
    distributorInfo: 'Global Coffee Distributors',
    category: '67febefa24a0a851f38ba243',
    type: 'Coffee Bean',
    subtype: 'Arabica',
    createdAt: '2025-04-27T12:47:57.007+00:00',
    updatedAt: '2025-04-27T12:47:57.007+00:00'
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request, response and next function mocks
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('getProducts', () => {
    

    
    test('should sort products by price in ascending order', async () => {
      // Setup request
      req.query.sort = 'price_asc';
      
      // Mock data
      const mockProducts = [mockProduct];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts)
      };
      
      Product.find.mockReturnValue(mockQuery);

      // Execute
      await productController.getProducts(req, res, next);

      // Assert
      expect(Product.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ price: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should sort products by price in descending order', async () => {
      // Setup request
      req.query.sort = 'price_desc';
      
      // Mock data
      const mockProducts = [mockProduct];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts)
      };
      
      Product.find.mockReturnValue(mockQuery);

      // Execute
      await productController.getProducts(req, res, next);

      // Assert
      expect(Product.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ price: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getProductById', () => {
    test('should get product by ID', async () => {
      // Setup request
      req.params.id = '68000cef3a0b4f8159733b1f';
      
      // Mock data
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct)
      });

      // Execute
      await productController.getProductById(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('68000cef3a0b4f8159733b1f');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          product: mockProduct
        }
      });
    });

    test('should return 404 if product not found', async () => {
      // Setup request
      req.params.id = 'nonexistentId';
      
      // Mock data
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Execute
      await productController.getProductById(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('nonexistentId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Product not found'
      });
    });
  });

  describe('createProduct', () => {
    test('should create a new product', async () => {
      // Setup request
      req.body = {
        name: 'Robusta Coffee Beans',
        model: 'RB-2024',
        serialNumber: 'SN0001233991',
        description: 'Strong and bold Robusta coffee beans',
        quantityInStock: 50,
        price: 12.99,
        currency: 'USD',
        category: '67febefa24a0a851f38ba243'
      };
      
      // Mock data
      Product.create.mockResolvedValue({
        _id: 'newProductId',
        ...req.body
      });

      // Execute
      await productController.createProduct(req, res, next);

      // Assert
      expect(Product.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          product: {
            _id: 'newProductId',
            ...req.body
          }
        }
      });
    });
  });
});