// controllers/userController.js
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const validator = require('validator');

exports.getProfile = catchAsync(async (req, res, next) => {
  // Log the user ID from the token for debugging
  console.log('Getting profile for user with ID:', req.user.id);
  
  // Find the user by ID and exclude sensitive information
  const user = await User.findById(req.user.id).select('-password -passwordConfirm -__v');

  if (!user) {
    console.log('User not found with ID:', req.user.id);
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  console.log('User found:', user.name, user.email);
  
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        address: user.address
      }
    }
  });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  // İstekten adres bilgilerini al
  const { street, city, postalCode } = req.body;

  // gerekli alanların kontrolü
  if (!street || !city || !postalCode) {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Please share the street, city and postalCode informations.' 
    });
  }

  // Remove strict postal code validation since it's causing problems
  // Allow any reasonable postal code format
  if (!postalCode || postalCode.length < 3) {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Invalid postal code format.' 
    });
  }
  

  // Kullanıcı adresini güncelle
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { address: { street, city, postalCode } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Utility function to check and fix user address
exports.checkAndFixAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  // Check if address is null or undefined
  if (!user.address) {
    // Initialize address with empty strings
    user.address = {
      street: '',
      city: '',
      postalCode: ''
    };
    await user.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Address checked and fixed if needed',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address
      }
    }
  });
});

// Get user by ID
exports.getUserById = catchAsync(async (req, res, next) => {
  // Log the requested user ID for debugging
  console.log('Getting user with ID:', req.params.userId);
  
  // Find the user by ID and exclude sensitive information
  const user = await User.findById(req.params.userId).select('name email photo -_id');

  if (!user) {
    console.log('User not found with ID:', req.params.userId);
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  console.log('User found:', user.name, user.email);
  
  res.status(200).json({
    status: 'success',
    data: {
      name: user.name,
      photo: user.photo
    }
  });
});