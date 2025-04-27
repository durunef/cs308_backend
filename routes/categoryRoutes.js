const express = require('express');
const {
  createCategory,
  getAllCategories,
  getProductsByCategory
} = require('../controllers/categoryController');

const router = express.Router();

router
  .route('/')
  .post(createCategory)      // POST   /api/categories
  .get(getAllCategories);    // GET    /api/categories

router
  .route('/:id/products')
  .get(getProductsByCategory); // GET   /api/categories/:id/products

module.exports = router;
