const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

// 1) Checkout: sepeti siparişe çevir, stokları düş, PDF fatura oluştur, e‑posta at.
exports.checkout = catchAsync(async (req, res, next) => {
  // (1) Kullanıcı sepete bak
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Cart is empty.' });
  }

  // (2) Toplamı ve order.items’ı hazırlayalım
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
    total
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

// 2) Kullanıcı “order history” sayfası için:
exports.getOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.product');
  res.status(200).json({ status: 'success', data: orders });
});
