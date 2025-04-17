// controllers/userController.js
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const validator = require('validator');

exports.getProfile = catchAsync(async (req, res, next) => {
  // Find the user by ID and exclude sensitive information
  const user = await User.findById(req.user.id).select('-password -passwordConfirm -__v');

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

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

  // postal code kontrol ediyorum any i değiştirebilrisn spesifik bir ülkenin postal code u için
  if (!validator.isPostalCode(postalCode, 'any')) {
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
