// controllers/productController.js
const Product  = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError  = require('../utils/appError');

// ─── GET /api/v1/product-manager/products ─────────────────────────────────────
exports.getProducts = catchAsync(async (req, res, next) => {
  // 1) build filter
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name:        { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // 2) build mongoose query
  let query = Product.find(filter).populate('category', 'name');

  // 3) sorting?
  if (req.query.sort) {
    const [field, order] = req.query.sort.split('_');
    if (['price','popularity'].includes(field) && ['asc','desc'].includes(order)) {
      const dir = order === 'asc' ? 1 : -1;
      query = query.sort({ [field]: dir });
    }
  }

  // 4) execute
  const products = await query;

  // 5) send response
  res.status(200).json({
    status:  'success',
    results: products.length,
    data: {
      products
    }
  });
});

// ─── POST /api/v1/product-manager/products ────────────────────────────────────
exports.createProduct = catchAsync(async (req, res, next) => {
  const productData = { ...req.body };
  
  // Handle image upload
  if (req.file) {
    productData.image = `/uploads/${req.file.filename}`;
  }
  
  // Ensure price and cost are null if not provided
  if (!productData.price) productData.price = null;
  if (!productData.cost) productData.cost = null;
  
  // Create the product
  const newProduct = await Product.create(productData);
  
  res.status(201).json({
    status: 'success',
    data: { product: newProduct }
  });
});

// ─── GET /api/v1/product-manager/products/:id ────────────────────────────────
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
                               .populate('category','name');
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// ─── PATCH /api/v1/product-manager/products/:id ──────────────────────────────
exports.updateProduct = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };
  if (req.file) updateData.image = `/uploads/${req.file.filename}`;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// ─── DELETE /api/v1/product-manager/products/:id ────────────────────────────
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});

// ─── PATCH /api/v1/product-manager/products/:id/stock ────────────────────────
exports.updateStock = catchAsync(async (req, res, next) => {
  const { quantityInStock } = req.body;
  if (quantityInStock == null || quantityInStock < 0) {
    return next(new AppError('Please provide a valid stock quantity', 400));
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { quantityInStock },
    { new: true, runValidators: true }
  );
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});
