const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');

// Yeni kategori oluşturma
exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { category: newCategory }
  });
});

// Tüm kategorileri listeleme
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

// Belirli bir kategoriye ait ürünleri listeleme
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate('products');
  if (!category) {
    return res.status(404).json({ status: 'fail', message: 'Category not found' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      category: category.name,
      description: category.description,
      products: category.products
    }
  });
});
