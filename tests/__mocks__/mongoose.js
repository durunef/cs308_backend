// tests/__mocks__/mongoose.js

const mongoose = {
  Schema: function(definition, options) {
    this.definition = definition;
    this.options = options;
    return this;
  },
  model: jest.fn(),
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
    readyState: 1,
    close: jest.fn()
  },
  disconnect: jest.fn().mockResolvedValue({}),
  Types: {
    ObjectId: jest.fn()
  }
};

// Add Types to Schema
mongoose.Schema.Types = {
  ObjectId: 'ObjectId',
  String: String,
  Number: Number,
  Date: Date,
  Boolean: Boolean,
  Array: Array,
  Mixed: 'Mixed'
};

// Add static methods to Schema
mongoose.Schema.prototype.pre = jest.fn();
mongoose.Schema.prototype.post = jest.fn();
mongoose.Schema.prototype.virtual = jest.fn();
mongoose.Schema.prototype.set = jest.fn();
mongoose.Schema.prototype.plugin = jest.fn();
mongoose.Schema.prototype.index = jest.fn();

// Mock ObjectId constructor
mongoose.Types.ObjectId = jest.fn((id) => id || 'mock-object-id');
mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);

module.exports = mongoose;