const Category  = require('../models/categoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError  = require('../utils/appError')

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
  const cats = await Category.find()
  if (!cats) {
    return next(new AppError('No categories found', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      categories: cats
    }
  })
})

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


// Kategori güncelleme
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!category) {
    return res.status(404).json({ status: 'fail', message: 'Category not found' });
  }
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

// Kategori silme
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ status: 'fail', message: 'Category not found' });
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});