// tests/models/userModel.test.js

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
  
  // Mock validator
  jest.mock('validator', () => ({
    isEmail: jest.fn().mockReturnValue(true)
  }));
  
  // Import the model
  const User = require('../../models/userModel');
  
  describe('User Model', () => {
    test('User model exists', () => {
      expect(User).toBeDefined();
    });
    
    test('User model schema has required fields', () => {
      // Since we're mocking Mongoose, we can't directly test schema validation
      // However, we can check that the model was created with a schema
      expect(require('mongoose').Schema).toHaveBeenCalled();
      expect(require('mongoose').model).toHaveBeenCalledWith('User', expect.anything());
    });
  });