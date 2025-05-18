// controllers/salesController.js
const Product    = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.setPrice = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { price }     = req.body;

  if (price == null || typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid price (number ≥ 0)'
    });
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { price },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.setDiscount = catchAsync(async (req, res, next) => {
  const { productId }      = req.params;
  const { discountPercent } = req.body;

  if (
    discountPercent == null ||
    typeof discountPercent !== 'number' ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a discount between 0 and 100'
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  product.discount = discountPercent;
  await product.save();

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});
