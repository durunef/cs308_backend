// controllers/salesController.js
const Product    = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.setPrice = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { price }     = req.body;

  // 1) Geçerli bir price girilmiş mi?
  if (price == null || typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid price (number ≥ 0)'
    });
  }

  // 2) Ürünü bulup fiyatı güncelle
  const product = await Product.findByIdAndUpdate(
    productId,
    { price },
    { new: true, runValidators: true }
  );

  // 3) Ürün yoksa 404 dön
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  // 4) Başarılı yanıt
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});
