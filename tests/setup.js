// tests/setup.js

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-database';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (optional)
// Uncomment these lines if you want to suppress console output during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn()
// };

// Global beforeEach to reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function for creating mock request objects
global.createMockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { _id: 'test-user-id', id: 'test-user-id' },
  headers: {},
  ...overrides
});

// Helper function for creating mock response objects
global.createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Helper function for creating mock next function
global.createMockNext = () => jest.fn();// tests/setup.js

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-database';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Global beforeEach to reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function for creating mock request objects
global.createMockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { _id: 'test-user-id', id: 'test-user-id' },
  headers: {},
  ...overrides
});

// Helper function for creating mock response objects
global.createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Helper function for creating mock next function
global.createMockNext = () => jest.fn();