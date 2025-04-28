// jest.setup.js
jest.mock('../utils/catchAsync', () => fn => fn);
jest.mock('jsonwebtoken');
jest.mock('pdfkit');
jest.mock('nodemailer');
jest.mock('fs');
jest.mock('path');
jest.mock('validator');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'testpassword';

// Setup MongoDB Memory Server
// This is optional but recommended, as it sets up an in-memory MongoDB server
// for testing instead of using your local MongoDB instance
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // Disconnect from the database and stop MongoDB Memory Server
  await mongoose.disconnect();
  await mongod.stop();
});

// Clear collections between tests to maintain isolation
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global console mock to avoid noisy test output
// Uncomment if you want to silence console during tests
/*
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
*/