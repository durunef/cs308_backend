// controllers/userController.js
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const validator = require('validator');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');

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

exports.getPurchasedProducts = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Check if the requesting user is the same as the userId or an admin
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to view this user\'s purchase history', 403));
  }

  // Find all orders for this user that have been delivered
  const orders = await Order.find({
    user: userId,
    status: 'delivered'
  }).populate('items.product', 'name price image');

  // Extract purchased products from orders
  const purchasedProducts = orders.flatMap(order => 
    order.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.priceAtPurchase,
      quantity: item.quantity,
      purchaseDate: order.createdAt
    }))
  );

  res.status(200).json({
    status: 'success',
    data: purchasedProducts
  });
});