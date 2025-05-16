// controllers/reviewController.js

const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const Order    = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');


/* Helper: ürün teslim edildi mi?                                     */
const hasUserReceivedProduct = async (userId, productId) => {
  const order = await Order.findOne({
    user   : userId,
    status : 'delivered',          // teslim edilmiş sipariş
    'items.product': productId
  });
  return !!order;                  // true / false
};

// CREATE REVIEW: POST /api/products/:id/reviews
exports.createReview = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id; // authMiddleware'dan alınan kullanıcı bilgisi

  // TODO: Ürünün teslim edilmiş olup olmadığını kontrol et.
  // Örneğin, hasUserReceivedProduct(productId, userId)
//bodyde ne yazman gerektiği
  const { rating, comment } = req.body;


   /* 1) Ürün teslim edilmiş mi? */
   const received = await hasUserReceivedProduct(userId, productId);
   if (!received) {
     return res.status(400).json({
       status : 'fail',
       message: 'You can review only products that have been delivered to you.'
     });
   }

  /* 2) Rating aralığı kontrolü (1-10) */
  if (rating < 1 || rating > 10) {
    return res.status(400).json({
      status : 'fail',
      message: 'Rating must be between 1 and 10.'
    });
  }


  //mongodb ye kaydetme
  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment
    // "approved" alanı yukarıdaki default ayara göre ayarlanır
  });


  
  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

// GET PRODUCT REVIEWS: GET /api/products/:id/reviews
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const productId = req.params.id;

  const reviews = await Review.find({ product: productId });
  

  //********************************************************************** 
  // Eğer review'da comment varsa ancak onaylanmamışsa, comment alanını boş döndürebiliriz.
  const processedReviews = reviews.map(review => {
    const reviewObj = review.toObject();
    if (reviewObj.comment && !reviewObj.approved) {
      reviewObj.comment = ''; // veya "Pending approval" şeklinde
    }
    return reviewObj;
  });
//*************************************************************************


  res.status(200).json({
    status: 'success',
    data: {
      reviews: processedReviews
    }
  });
});

// APPROVE REVIEW: PUT /api/reviews/:reviewId/approve
exports.approveReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.reviewId;

  // Bu endpoint, ürün yöneticisi tarafından kullanılmalıdır.
  const review = await Review.findByIdAndUpdate(reviewId, { approved: true }, { new: true, runValidators: true });
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// GET PENDING REVIEWS: GET /api/reviews/pending
exports.getPendingReviews = catchAsync(async (req, res, next) => {
  // Find reviews that have comments but are not approved yet
  const pendingReviews = await Review.find({
    comment: { $exists: true, $ne: '' },
    approved: false
  }).populate({
    path: 'product',
    select: 'name images'
  }).populate({
    path: 'user',
    select: 'name email'
  });

  res.status(200).json({
    status: 'success',
    data: {
      pendingReviews
    }
  });
});

// Tüm yorumları getir
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('product', 'name')
    .populate('user', 'name email');
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

// Yorumu reddet
exports.rejectReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  // Yorumu silmek veya sadece onay durumunu false yapmak isteyebilirsin.
  // Burada yorumu siliyoruz:
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});
