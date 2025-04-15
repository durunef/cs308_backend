const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Kategori oluşturma (POST /api/categories)
router.post('/', categoryController.createCategory);

// Belirli bir kategoriye ait ürünleri listeleme (GET /api/categories/:id/products)
router.get('/:id/products', categoryController.getProductsByCategory);

module.exports = router;
