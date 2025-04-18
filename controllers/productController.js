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

// 2) Ürünleri arama ve sıralama mantığıyla listeleme
exports.getProducts = catchAsync(async (req, res, next) => {
  const { search, sort } = req.query;
  let filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let query = Product.find(filter);

  if (sort) {
    const [field, order] = sort.split('_');
    if (field && order && ['price', 'popularity'].includes(field)) {
      const sortOrder = order === 'asc' ? 1 : -1;
      query = query.sort({ [field]: sortOrder });
    }
  }

  const products = await query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
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


