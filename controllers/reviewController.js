// controllers/reviewController.js

const Review     = require('../models/reviewModel');
const Product    = require('../models/productModel');
const Order      = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

/**
 * Helper: ürün teslim edilmiş mi?
 */
const hasUserReceivedProduct = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    status: 'delivered',
    'items.product': productId
  });
  return !!order;
};

// POST /api/products/:id/reviews
exports.createReview = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId    = req.user.id;
  const { rating, comment } = req.body;

  // 1) Teslim kontrolü
  const received = await hasUserReceivedProduct(userId, productId);
  if (!received) {
    return res.status(400).json({
      status: 'fail',
      message: 'You can review only products that have been delivered to you.'
    });
  }

  // 2) Rating aralığı
  if (rating < 1 || rating > 10) {
    return res.status(400).json({
      status : 'fail',
      message: 'Rating must be between 1 and 10.'
    });
  }

  // 3) Kaydet
  const review = await Review.create({
    product: productId,
    user:    userId,
    rating,
    comment
    // approved: schema default (false)
  });

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

// GET /api/products/:id/reviews
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const reviews   = await Review.find({ product: productId });

  // Onaylanmamış comment’leri gizle
  const processed = reviews.map(r => {
    const obj = r.toObject();
    if (obj.comment && !obj.approved) obj.comment = '';
    return obj;
  });

  res.status(200).json({
    status: 'success',
    data: { reviews: processed }
  });
});

// PATCH /api/v1/product-manager/reviews/:reviewId/approve
exports.approveReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { approved: true },
    { new: true, runValidators: true }
  );
  if (!review) {
    return res.status(404).json({ status:'fail', message:'Review not found' });
  }
  res.status(200).json({ status:'success', data:{ review } });
});

// PATCH /api/v1/product-manager/reviews/:reviewId/reject
exports.rejectReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ status:'fail', message:'Review not found' });
  }
  res.status(204).end();
});

// GET pending reviews (if you still need it elsewhere)
exports.getPendingReviews = catchAsync(async (req, res, next) => {
  const pending = await Review.find({
    comment: { $exists:true, $ne: '' },
    approved: false
  })
    .populate('product', 'name images')
    .populate('user',    'name email');

  res.status(200).json({
    status: 'success',
    data: { pendingReviews: pending }
  });
});

// GET ALL reviews (manager console)
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('product', 'name')
    .populate('user',    'name email');

  res.status(200).json({
    status:  'success',
    results: reviews.length,
    data:    { reviews }
  });
});
