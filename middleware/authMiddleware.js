const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables!');
  throw new Error('JWT_SECRET is not set in environment variables!');
}

exports.protect = catchAsync(async (req, res, next) => {
  console.log('Auth middleware - Headers:', req.headers);
  
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Auth middleware - Token found:', token);
  } else {
    console.log('Auth middleware - No token found in headers');
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded token:', decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    console.log('Auth middleware - Current user:', currentUser);
    
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    console.error('Auth middleware - Error:', err);
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
});
