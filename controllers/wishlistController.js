const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Add product to wishlist
const addToWishlist = catchAsync(async (req, res, next) => {
  console.log('Adding to wishlist - User:', req.user);
  console.log('Adding to wishlist - Request body:', req.body);
  console.log('Adding to wishlist - Headers:', req.headers);
  
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if already in wishlist
  const existingWishlistItem = await Wishlist.findOne({
    userId: req.user._id,
    productId: productId
  });

  if (existingWishlistItem) {
    return next(new AppError('Product already in wishlist', 400));
  }

  // Create wishlist item
  const wishlistItem = await Wishlist.create({
    userId: req.user._id,
    productId: productId,
    lastNotifiedPrice: product.discountedPrice || product.price
  });

  res.status(201).json({
    status: 'success',
    data: {
      wishlistItem
    }
  });
});

// Remove product from wishlist
const removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlistItem = await Wishlist.findOneAndDelete({
    userId: req.user._id,
    productId: productId
  });

  if (!wishlistItem) {
    return next(new AppError('Product not found in wishlist', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get user's wishlist
const getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.find({ userId: req.user._id })
    .populate({
      path: 'productId',
      select: 'name price discount discountedPrice image description'
    });

  res.status(200).json({
    status: 'success',
    results: wishlist.length,
    data: {
      wishlist
    }
  });
});

// Toggle discount notification
const toggleDiscountNotification = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { notifyOnDiscount } = req.body;

  const wishlistItem = await Wishlist.findOneAndUpdate(
    {
      userId: req.user._id,
      productId: productId
    },
    { notifyOnDiscount },
    { new: true }
  );

  if (!wishlistItem) {
    return next(new AppError('Product not found in wishlist', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      wishlistItem
    }
  });
});

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  toggleDiscountNotification
}; 