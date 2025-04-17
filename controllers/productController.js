// controllers/productController.js

const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find().populate('category', 'name');

  res.status(200).json({
    status: 'success',
    data: {
      products
    }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  // Gelen verilerle yeni ürün oluşturulur.
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});


