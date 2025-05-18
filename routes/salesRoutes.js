// routes/salesRoutes.js
const express        = require('express');
const router         = express.Router();
const { protect }    = require('../middleware/authMiddleware');
const  restrictTo  = require('../middleware/restrictTo');
const salesController = require('../controllers/salesController');

// 1) Global olarak tüm sales rotalarında önce authenticate + authorize
router.use(protect, restrictTo('sales-manager'));


// PATCH /api/sales/price/:productId
router.patch('/price/:productId', salesController.setPrice);

// PATCH /api/sales/discount/:productId
router.patch('/discount/:productId', salesController.setDiscount);

// GET /api/sales/invoices?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/invoices', salesController.getInvoicesInRange)

module.exports = router;

