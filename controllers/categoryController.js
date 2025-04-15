const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

// Yeni kategori oluşturma
exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory
    }
  });
});

// Belirli bir kategoriye ait ürünleri listeleme (virtual populate kullanılarak)
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Kategori bulunduysa, ilgili ürünleri de populate eder
  const category = await Category.findById(id).populate('products');
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
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
