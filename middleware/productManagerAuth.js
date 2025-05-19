// middleware/productManagerAuth.js

const AppError = require('../utils/appError');

exports.restrictToProductManager = (req, res, next) => {
  // allow both exact product-manager *and* general-manager
  if (
       req.user.role !== 'product-manager' &&
       req.user.role !== 'general-manager'
     ) {
    return next(new AppError('You do not have permission to access this resource', 403));
  }
  next();
};
