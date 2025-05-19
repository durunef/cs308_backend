const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Refund = require('../models/refundModel');

// Optional email service
let emailService;
try {
  emailService = require('../utils/emailService');
} catch (error) {
  console.log('Email service not available:', error.message);
}

// 1) Checkout: sepeti siparişe çevir, stokları düş, PDF fatura oluştur, e‑posta at.
exports.checkout = catchAsync(async (req, res, next) => {
  // (1) Kullanıcı sepete bak
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Cart is empty.' });
  }

  // Get user data for shipping address
  const user = await User.findById(req.user.id);
  
  // Check if user exists
  if (!user) {
    return res.status(404).json({ 
      status: 'fail', 
      message: 'User not found.' 
    });
  }
  
  // Check if address object exists
  if (!user.address) {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Address information is missing. Please update your profile before checkout.' 
    });
  }
  
  // Check if all required address fields are filled out
  const { street, city, postalCode } = user.address;
  if (!street || street.trim() === '' || !city || city.trim() === '' || !postalCode || postalCode.trim() === '') {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Please complete your address information in your profile before checkout.' 
    });
  }

  // (2) Toplamı ve order.items'ı hazırlayalım
  let total = 0;
  const orderItems = cart.items.map(i => {
    total += i.product.price * i.quantity;
    return {
      product: i.product._id,
      quantity: i.quantity,
      priceAtPurchase: i.product.price
    };
  });

  // (3) Siparişi kaydet
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    total,
    shippingAddress: {
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim()
    }
  });

  // (4) Stokları güncelle
  await Promise.all(orderItems.map(async item => {
    const p = await Product.findById(item.product);
    p.quantityInStock -= item.quantity;
    return p.save();
  }));

  // (5) Sepeti temizle
  cart.items = [];
  await cart.save();

  // (6) PDF fatura oluştur ve diske yaz
  const doc = new PDFDocument();
  const filename = `invoice-${order._id}.pdf`;
  const invoicesDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  const filePath = path.join(invoicesDir, filename);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(16).text(`Invoice for Order ${order._id}`, { underline: true });
  doc.moveDown().fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
  doc.moveDown();
  
  // Add shipping address to invoice
  doc.fontSize(14).text('Shipping Address:', { underline: true });
  doc.fontSize(12).text(`${user.name}`);
  doc.text(`${order.shippingAddress.street}`);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
  doc.moveDown();
  
  doc.fontSize(14).text('Order Items:', { underline: true });
  order.items.forEach(it => {
    doc.text(`• ${it.quantity} × ${it.priceAtPurchase.toFixed(2)} (product ${it.product})`);
  });
  doc.moveDown().text(`TOTAL: ${order.total.toFixed(2)}`);
  doc.end();
  await new Promise(resolve => writeStream.on('finish', resolve));

  // (7) Mail gönder
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  await transporter.sendMail({
    from: `"My Shop" <${process.env.SMTP_USER}>`,
    to: req.user.email,
    subject: `Your Invoice #${order._id}`,
    text: `Thank you for your order! Your invoice is attached.`,
    attachments: [{ filename, path: filePath }]
  });

  // (8) Yanıt dön
  res.status(200).json({
    status: 'success',
    data: {
      order,
      invoiceUrl: `/invoices/${filename}`
    }
  });
});

// 2) Kullanıcı "order history" sayfası için:
exports.getOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.product');
  res.status(200).json({ status: 'success', data: orders });
});

//da
// 3) Sipariş durumunu güncelleme:
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;             // URL'den gelen order ID
  const { status } = req.body;           // body'deki yeni durum

  // Geçerli bir durum mu?
  if (!['processing', 'in-transit', 'delivered'].includes(status)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid status value'
    });
  }

  // Order'ı bul ve güncelle
  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('items.product');

  if (!order) {
    return res.status(404).json({ status: 'fail', message: 'Order not found' });
  }

  res.status(200).json({ status: 'success', data: order });
});

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    console.log('Cancel order request received:', {
      orderId: req.params.orderId,
      userId: req.user._id
    });

    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      console.log('Order not found:', req.params.orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      console.log('Authorization failed:', {
        orderUserId: order.user.toString(),
        requestUserId: req.user._id.toString()
      });
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order is in processing status
    if (order.status !== 'processing') {
      console.log('Invalid order status:', order.status);
      return res.status(400).json({ 
        message: 'Order can only be cancelled if it is in processing status' 
      });
    }

    // Update order status and add cancellation timestamp
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        status: 'cancelled',
        cancelledAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      console.log('Failed to update order:', req.params.orderId);
      return res.status(500).json({ message: 'Failed to update order status' });
    }

    console.log('Order updated successfully:', {
      orderId: updatedOrder._id,
      newStatus: updatedOrder.status,
      cancelledAt: updatedOrder.cancelledAt
    });

    // Return products to stock
    for (const item of updatedOrder.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    res.status(200).json({ 
      message: 'Order cancelled successfully',
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};

// Request a refund for specific items in an order
exports.requestRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to request refund for this order' });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'Refund can only be requested for delivered orders' 
      });
    }

    // Check if order is within 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (order.createdAt < thirtyDaysAgo) {
      return res.status(400).json({ 
        message: 'Refund can only be requested within 30 days of purchase' 
      });
    }

    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please specify items to refund' });
    }

    // Calculate total refund amount
    let totalRefundAmount = 0;
    const refundItems = [];

    for (const refundItem of items) {
      const orderItem = order.items.find(item => 
        item.product.toString() === refundItem.productId
      );

      if (!orderItem) {
        return res.status(400).json({ 
          message: `Product ${refundItem.productId} not found in order` 
        });
      }

      if (refundItem.quantity > orderItem.quantity) {
        return res.status(400).json({ 
          message: `Refund quantity cannot exceed purchased quantity for product ${refundItem.productId}` 
        });
      }

      totalRefundAmount += orderItem.priceAtPurchase * refundItem.quantity;
      refundItems.push({
        product: refundItem.productId,
        quantity: refundItem.quantity,
        priceAtPurchase: orderItem.priceAtPurchase,
        reason: refundItem.reason
      });
    }

    // Create refund request
    const refund = new Refund({
      order: order._id,
      user: req.user._id,
      items: refundItems,
      totalRefundAmount
    });

    await refund.save();

    // Send email notification if email service is available
    if (emailService) {
      try {
        await emailService.sendEmail({
          to: req.user.email,
          subject: 'Refund Request Received',
          text: `Your refund request for order #${order._id} has been received and is being processed.`
        });
      } catch (error) {
        console.error('Failed to send email notification:', error);
        // Continue with the response even if email fails
      }
    }

    res.status(201).json({ 
      message: 'Refund request submitted successfully',
      refund 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting refund', error: error.message });
  }
};

// Get refund status
exports.getRefundStatus = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.refundId);
    
    if (!refund) {
      return res.status(404).json({ message: 'Refund request not found' });
    }

    // Check if the refund belongs to the user
    if (refund.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this refund' });
    }

    res.status(200).json({ refund });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching refund status', error: error.message });
  }
};

