// controllers/salesController.js
const Product    = require('../models/productModel');
const Order = require('../models/orderModel');
const Refund  = require('../models/refundModel');
const catchAsync = require('../utils/catchAsync');
const Wishlist = require('../models/wishlistModel');
const { sendEmail } = require('../utils/emailService');
const Notification = require('../models/notificationModel');

exports.setPrice = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { price }     = req.body;

  if (price == null || typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid price (number ≥ 0)'
    });
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { price },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.setDiscount = catchAsync(async (req, res, next) => {
  const { productId }      = req.params;
  const { discountPercent } = req.body;

  if (
    discountPercent == null ||
    typeof discountPercent !== 'number' ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a discount between 0 and 100'
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  product.discount = discountPercent;
  await product.save();

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.getInvoicesInRange = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide both start and end date in YYYY-MM-DD format'
    });
  }

  // YYYY-MM-DDT00:00:00.000Z ve YYYY-MM-DDT23:59:59.999Z formatında UTC parse
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate   = new Date(`${end}T23:59:59.999Z`);
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid date format'
    });
  }

  // O aralıktaki tüm siparişleri bul
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Sadece ihtiyacımız olan alanları döndür
  const invoices = orders.map(o => ({
    orderId:    o._id,
    createdAt:  o.createdAt,
    // Statik olarak serve ettiğimiz yol:
    invoiceUrl: `/invoices/invoice-${o._id}.pdf`
  }));

  res.status(200).json({
    status:  'success',
    results: invoices.length,
    data:    { invoices }
  });
});

exports.getRevenueReport = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide both start and end date as YYYY-MM-DD'
    });
  }

  // UTC bazlı aralığı oluştur
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate   = new Date(`${end}T23:59:59.999Z`);
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid date format'
    });
  }

  // Aggregate pipeline: gün bazında ciro topla
  const revenueData = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' }
    }},
    { $sort: { '_id': 1 } }
  ]);

  // Yanıta uygun formatta dön
  res.status(200).json({
    status: 'success',
    data: {
      report: revenueData.map(d => ({
        date: d._id,
        revenue: d.revenue
      }))
    }
  });
});

exports.getProfitReport = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide both start and end date as YYYY-MM-DD'
    });
  }
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate   = new Date(`${end}T23:59:59.999Z`);
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid date format'
    });
  }

  const profitData = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $unwind: '$items' },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        profit: {
          $sum: {
            $multiply: [
              { $subtract: [ '$items.priceAtPurchase', '$items.costAtPurchase' ] },
              '$items.quantity'
            ]
          }
        }
    }},
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      report: profitData.map(d => ({
        date:   d._id,
        profit: d.profit
      }))
    }
  });
});

// 1) Bekleyen (pending) iade taleplerini listele
exports.getPendingRefunds = catchAsync(async (req, res) => {
  const refunds = await Refund.find({ status: 'pending' })
    .populate('order', 'user total')
    .populate('user', 'name email')
    .populate('items.product', 'name');

  res.status(200).json({
    status: 'success',
    results: refunds.length,
    data: { refunds }
  });
});

// 2) İade isteğini onayla (approve)
exports.approveRefund = catchAsync(async (req, res) => {
  const { id } = req.params;
  const refund = await Refund.findById(id);

  if (!refund) {
    return res.status(404).json({ status: 'fail', message: 'Refund request not found' });
  }
  if (refund.status !== 'pending') {
    return res.status(400).json({ status: 'fail', message: 'Refund already processed' });
  }

  // — Stokları geri ekle
  for (const item of refund.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { quantityInStock: item.quantity } }
    );
  }

  // — Durumu güncelle
  refund.status     = 'approved';
  refund.approvedAt = Date.now();
  await refund.save();

  // — (İsteğe bağlı) Müşteriye bildirim gönderme
  // notifyCustomer(refund.user, `Your refund ${refund._id} has been approved`);

  res.status(200).json({
    status: 'success',
    message: 'Refund approved',
    data: { refund }
  });
});

// 3) İade isteğini reddet (reject)
exports.rejectRefund = catchAsync(async (req, res) => {
  const { id } = req.params;
  const refund = await Refund.findById(id);

  if (!refund) {
    return res.status(404).json({ status: 'fail', message: 'Refund request not found' });
  }
  if (refund.status !== 'pending') {
    return res.status(400).json({ status: 'fail', message: 'Refund already processed' });
  }

  refund.status     = 'rejected';
  refund.approvedAt = Date.now(); // karar verme zamanı
  await refund.save();

  // notifyCustomer(refund.user, `Your refund ${refund._id} has been rejected`);

  res.status(200).json({
    status: 'success',
    message: 'Refund rejected',
    data: { refund }
  });
});

// Notify wishlist users about discount
exports.notifyDiscount = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { discountPercent, originalPrice, newPrice } = req.body;

  // Find all wishlist items for this product with notifications enabled
  const wishlistItems = await Wishlist.find({
    productId,
    notifyOnDiscount: true
  }).populate('userId', 'email name')
    .populate('productId', 'name');

  // Create notifications for each user
  const notifications = wishlistItems.map(async (item) => {
    try {
      // Create notification
      const notification = await Notification.create({
        userId: item.userId._id,
        title: 'Price Drop Alert! 🎉',
        message: `${item.productId.name} has been discounted by ${discountPercent}%! New price: $${newPrice.toFixed(2)} (was $${originalPrice.toFixed(2)})`,
        type: 'discount',
        link: `/product/${productId}`,
        read: false
      });

      // Send email notification if email service is available
      if (sendEmail) {
        await sendEmail({
          to: item.userId.email,
          subject: 'Price Drop Alert! 🎉',
          text: `Hello ${item.userId.name},\n\n` +
                `A product in your wishlist has been discounted!\n\n` +
                `Product: ${item.productId.name}\n` +
                `Original Price: $${originalPrice.toFixed(2)}\n` +
                `New Price: $${newPrice.toFixed(2)}\n` +
                `Discount: ${discountPercent}%\n\n` +
                `Visit our website to check it out!\n\n` +
                `Best regards,\nYour Coffee Shop Team`
        });
      }

      // Update last notified price
      item.lastNotifiedPrice = newPrice;
      await item.save();

      return { success: true, userId: item.userId._id, notification };
    } catch (error) {
      console.error(`Failed to notify user ${item.userId._id}:`, error);
      return { success: false, userId: item.userId._id, error: error.message };
    }
  });

  // Wait for all notifications to be sent
  const results = await Promise.all(notifications);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  res.status(200).json({
    status: 'success',
    data: {
      totalNotified: wishlistItems.length,
      successful,
      failed,
      notifications: results.filter(r => r.success).map(r => r.notification)
    }
  });
});
