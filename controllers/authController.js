// controllers/authController.js

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

// Token üretme fonksiyonu: Payload içerisine id, email ve role ekleniyor.
const signToken = (userId, userEmail, userRole) => {
  return jwt.sign(
    { id: userId, email: userEmail, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

exports.signup = catchAsync(async (req, res, next) => {
  req.body.email = req.body.email.toLowerCase();
  const emailParts = req.body.email.split('@');
  const domain = emailParts.length === 2 ? emailParts[1] : '';

  if (domain === 'admin.com') {
    req.body.role = 'admin';
  } else if (domain === 'delivery.com') {
    req.body.role = 'delivery';
  } else {
    req.body.role = 'user';
  }

  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({ name, email, password, passwordConfirm, role });

  const token = signToken(newUser._id, newUser.email, newUser.role);

  res.status(201).json({
    status: 'success',
    data: { user: newUser },
    token
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password!'
    });
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.password !== password) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password'
    });
  }

  const token = signToken(user._id, user.email, user.role);
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    token
  });
});
