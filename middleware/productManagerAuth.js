const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.restrictToProductManager = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'product-manager') {
    return next(new AppError('You do not have permission to access this route', 403));
  }
  next();
}); 