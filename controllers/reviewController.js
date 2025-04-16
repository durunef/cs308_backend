// controllers/reviewController.js

const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

// CREATE REVIEW: POST /api/products/:id/reviews
exports.createReview = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id; // authMiddleware'dan alınan kullanıcı bilgisi

  // TODO: Ürünün teslim edilmiş olup olmadığını kontrol et.
  // Örneğin, hasUserReceivedProduct(productId, userId)
//bodyde ne yazman gerektiği
  const { rating, comment } = req.body;

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
