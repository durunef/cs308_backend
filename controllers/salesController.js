// controllers/salesController.js
const Product    = require('../models/productModel');
const Order = require('../models/orderModel');
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


exports.getInvoicesInRange = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide both start and end date in YYYY-MM-DD format'
    });
  }

  // YYYY-MM-DDT00:00:00.000Z ve YYYY-MM-DDT23:59:59.999Z formatında UTC parse
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate   = new Date(`${end}T23:59:59.999Z`);
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid date format'
    });
  }

  // O aralıktaki tüm siparişleri bul
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Sadece ihtiyacımız olan alanları döndür
  const invoices = orders.map(o => ({
    orderId:    o._id,
    createdAt:  o.createdAt,
    // Statik olarak serve ettiğimiz yol:
    invoiceUrl: `/invoices/invoice-${o._id}.pdf`
  }));

  res.status(200).json({
    status:  'success',
    results: invoices.length,
    data:    { invoices }
  });
});
