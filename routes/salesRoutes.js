// routes/salesRoutes.js
const express        = require('express');
const router         = express.Router();
const { protect }    = require('../middleware/authMiddleware');
const  restrictTo  = require('../middleware/restrictTo');
const salesController = require('../controllers/salesController');
const catchAsync     = require('../utils/catchAsync');      
const path           = require('path');    
const fs             = require('fs');   

// 1) Global olarak tüm sales rotalarında önce authenticate + authorize
router.use(protect, restrictTo('sales-manager'));


// PATCH /api/sales/price/:productId
router.patch('/price/:productId', salesController.setPrice);

// PATCH /api/sales/discount/:productId
router.patch('/discount/:productId', salesController.setDiscount);

// GET /api/sales/invoices?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/invoices', salesController.getInvoicesInRange)


// PDF’i download olarak indirtmek için
router.get(
    '/invoices/:orderId/download',
    catchAsync(async (req, res, next) => {
      const { orderId } = req.params;
      const filePath = path.join(__dirname, '../invoices', `invoice-${orderId}.pdf`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: 'fail',
          message: 'Invoice not found'
        });
      }
      res.download(filePath, `invoice-${orderId}.pdf`);
    })
  );


  // revenue report
router.get('/reports/revenue', salesController.getRevenueReport);

// kâr/zarar raporu
router.get('/reports/profit', salesController.getProfitReport);


// 1) Pending refund taleplerini listele
//    GET /api/sales/refunds
router.get('/refunds', salesController.getPendingRefunds);

// 2) Onayla (approve) refund
//    PATCH /api/sales/refunds/:id/approve
router.patch('/refunds/:id/approve', salesController.approveRefund);

// 3) Reddet (reject) refund
//    PATCH /api/sales/refunds/:id/reject
router.patch('/refunds/:id/reject', salesController.rejectRefund);

module.exports = router;

