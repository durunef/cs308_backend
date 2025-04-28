const mongoose = { 
  Schema: jest.fn().mockImplementation(() => ({
    virtual: jest.fn().mockReturnThis(),
    set: jest.fn()
  })),
  model: jest.fn().mockReturnValue({}),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => 'mockedObjectId')
  }
}; module.exports = mongoose;
