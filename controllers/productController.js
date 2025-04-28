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
  // Process image upload
  const productData = { ...req.body };
  
  // If file was uploaded, add the image path to the product data
  if (req.file) {
    // Create relative URL path for the image
    productData.image = `/uploads/${req.file.filename}`;
  }

  // Create new product with the provided data
  const newProduct = await Product.create(productData);

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