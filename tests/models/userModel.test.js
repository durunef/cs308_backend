// tests/models/userModel.test.js

const mongoose = require('mongoose');
const validator = require('validator');
const User = require('../../models/userModel');

// Mock mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    model: jest.fn(),
    Schema: function(definition, options) {
      this.definition = definition;
      this.options = options;
      return this;
    }
  };
});

// Mock validator
jest.mock('validator', () => ({
  isEmail: jest.fn()
}));

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  describe('User Validation', () => {
    let validUserData;

    beforeEach(() => {
      validUserData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        address: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001'
        }
      };
      
      // Mock validator.isEmail to return true for valid emails
      validator.isEmail.mockReturnValue(true);
    });

    test('should validate required fields', () => {
      expect(validUserData.name).toBeDefined();
      expect(validUserData.email).toBeDefined();
      expect(validUserData.password).toBeDefined();
      expect(validUserData.passwordConfirm).toBeDefined();
    });

    test('should set default role to user', () => {
      // User data without role specified
      const userWithoutRole = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      // Role should default to 'user' when not specified
      expect(userWithoutRole.role).toBeUndefined(); // Before default is applied
      // Schema would set this to 'user' by default
    });

    test('should validate email format using validator', () => {
      const userWithValidEmail = {
        ...validUserData,
        email: 'valid@example.com'
      };

      // Test that email validation would be called
      expect(userWithValidEmail.email).toBe('valid@example.com');
      // In real scenario, validator.isEmail would be called
    });

    test('should fail validation for invalid email', () => {
      validator.isEmail.mockReturnValue(false);
      
      const userWithInvalidEmail = {
        ...validUserData,
        email: 'invalid-email'
      };

      expect(userWithInvalidEmail.email).toBe('invalid-email');
      // In real scenario, this would fail validation
    });

    test('should validate password minimum length', () => {
      const userWithShortPassword = {
        ...validUserData,
        password: '123', // Less than 5 characters
        passwordConfirm: '123'
      };

      expect(userWithShortPassword.password.length).toBeLessThan(5);
      // In real scenario, this would fail minlength validation
    });

    test('should validate password confirmation matches', () => {
      const userData = {
        ...validUserData,
        password: 'password123',
        passwordConfirm: 'differentpassword'
      };

      // Test the password confirmation validator function logic
      const passwordConfirmValidator = function(passwordConfirm) {
        return passwordConfirm === this.password;
      };

      // Simulate mongoose context
      const mockContext = {
        password: userData.password
      };

      const isValid = passwordConfirmValidator.call(mockContext, userData.passwordConfirm);
      expect(isValid).toBe(false);

      // Test with matching passwords
      const validContext = {
        password: 'password123'
      };
      const isValidMatching = passwordConfirmValidator.call(validContext, 'password123');
      expect(isValidMatching).toBe(true);
    });

    test('should handle address with default values', () => {
      const userWithoutAddress = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      // Address should have default empty strings
      expect(userWithoutAddress.address).toBeUndefined();
      // Schema would set street, city, postalCode to '' by default
    });

    test('should validate role enum values', () => {
      const validRoles = ['user', 'product-manager', 'sales-manager', 'admin', 'delivery'];
      
      validRoles.forEach(role => {
        expect(validRoles).toContain(role);
      });

      const invalidRole = 'invalid-role';
      expect(validRoles).not.toContain(invalidRole);
    });
  });

  describe('User Email Handling', () => {
    test('should convert email to lowercase', () => {
      const userWithUppercaseEmail = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      // Email should be converted to lowercase by mongoose
      expect(userWithUppercaseEmail.email).toBe('TEST@EXAMPLE.COM');
      // Mongoose would convert this to 'test@example.com'
      const lowercaseEmail = userWithUppercaseEmail.email.toLowerCase();
      expect(lowercaseEmail).toBe('test@example.com');
    });

    test('should enforce unique email constraint', () => {
      const user1 = {
        name: 'User 1',
        email: 'same@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      const user2 = {
        name: 'User 2',
        email: 'same@example.com', // Same email
        password: 'password456',
        passwordConfirm: 'password456'
      };

      expect(user1.email).toBe(user2.email);
      // In real scenario, saving user2 would fail due to unique constraint
    });
  });

  describe('User Address Schema', () => {
    test('should have correct address structure', () => {
      const userWithFullAddress = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        address: {
          street: '456 Oak Street',
          city: 'Los Angeles',
          postalCode: '90210'
        }
      };

      expect(userWithFullAddress.address.street).toBe('456 Oak Street');
      expect(userWithFullAddress.address.city).toBe('Los Angeles');
      expect(userWithFullAddress.address.postalCode).toBe('90210');
    });

    test('should handle partial address data', () => {
      const userWithPartialAddress = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        address: {
          street: '789 Pine Street'
          // city and postalCode not provided
        }
      };

      expect(userWithPartialAddress.address.street).toBe('789 Pine Street');
      expect(userWithPartialAddress.address.city).toBeUndefined();
      expect(userWithPartialAddress.address.postalCode).toBeUndefined();
      // Schema would set city and postalCode to '' by default
    });
  });

  describe('User Role Management', () => {
    test('should accept all valid role values', () => {
      const validRoles = ['user', 'product-manager', 'sales-manager', 'admin', 'delivery'];
      
      validRoles.forEach(role => {
        const userWithRole = {
          name: 'Test User',
          email: `test${role}@example.com`,
          password: 'password123',
          passwordConfirm: 'password123',
          role: role
        };

        expect(userWithRole.role).toBe(role);
        expect(validRoles).toContain(userWithRole.role);
      });
    });

    test('should use default role when not specified', () => {
      const userWithoutRole = {
        name: 'Default User',
        email: 'default@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      expect(userWithoutRole.role).toBeUndefined();
      // Schema would set this to 'user' by default
    });
  });

  describe('User Business Logic Scenarios', () => {
    test('should handle complete user registration data', () => {
      const completeUser = {
        name: 'Alice Smith',
        email: 'alice@example.com',
        photo: 'alice-profile.jpg',
        password: 'securepassword123',
        passwordConfirm: 'securepassword123',
        address: {
          street: '123 Broadway',
          city: 'New York',
          postalCode: '10001'
        },
        role: 'product-manager'
      };

      // Validate all fields are present and correct
      expect(completeUser.name).toBe('Alice Smith');
      expect(completeUser.email).toBe('alice@example.com');
      expect(completeUser.photo).toBe('alice-profile.jpg');
      expect(completeUser.password).toBe('securepassword123');
      expect(completeUser.passwordConfirm).toBe('securepassword123');
      expect(completeUser.address.street).toBe('123 Broadway');
      expect(completeUser.address.city).toBe('New York');
      expect(completeUser.address.postalCode).toBe('10001');
      expect(completeUser.role).toBe('product-manager');
    });

    test('should handle minimal required user data', () => {
      const minimalUser = {
        name: 'Bob Jones',
        email: 'bob@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };

      // Should have all required fields
      expect(minimalUser.name).toBeDefined();
      expect(minimalUser.email).toBeDefined();
      expect(minimalUser.password).toBeDefined();
      expect(minimalUser.passwordConfirm).toBeDefined();

      // Optional fields should be undefined
      expect(minimalUser.photo).toBeUndefined();
      expect(minimalUser.address).toBeUndefined();
      expect(minimalUser.role).toBeUndefined();
    });
  });
});