// tests/models/categoryModel.test.js

// Mock mongoose
jest.mock('mongoose', () => {
    const mSchema = {
      virtual: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      pre: jest.fn().mockReturnThis()
    };
    
    return {
      Schema: jest.fn().mockImplementation(() => mSchema),
      model: jest.fn().mockReturnValue({
        create: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        deleteMany: jest.fn()
      }),
      Types: {
        ObjectId: jest.fn().mockImplementation(() => 'mockedObjectId')
      }
    };
  });
  
  // Import the model
  const Category = require('../../models/categoryModel');
  
  describe('Category Model', () => {
    test('Category model exists', () => {
      expect(Category).toBeDefined();
    });
    
    test('Category model schema has required fields', () => {
      // Since we're mocking Mongoose, we can't directly test schema validation
      // However, we can check that the model was created with a schema
      expect(require('mongoose').Schema).toHaveBeenCalled();
      expect(require('mongoose').model).toHaveBeenCalledWith('Category', expect.anything());
    });
  });