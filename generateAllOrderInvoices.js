const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const Order = require('./models/orderModel');
const User = require('./models/userModel');
const Product = require('./models/productModel');

const DB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecommerce';

async function generateInvoice(order, user) {
  const filename = `invoice-${order._id}.pdf`;
  const invoicesDir = path.join(__dirname, 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  const filePath = path.join(invoicesDir, filename);
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(16).text(`Invoice for Order ${order._id}`, { underline: true });
  doc.moveDown().fontSize(12).text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();

  // Shipping address
  doc.fontSize(14).text('Shipping Address:', { underline: true });
  doc.fontSize(12).text(`${user.name}`);
  doc.text(`${order.shippingAddress.street}`);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
  doc.moveDown();

  // Order items
  doc.fontSize(14).text('Order Items:', { underline: true });
  for (const it of order.items) {
    let productName = '';
    if (it.product && typeof it.product === 'object' && it.product.name) {
      productName = it.product.name;
    } else if (it.product && typeof it.product === 'string') {
      // Try to fetch product name
      try {
        const prod = await Product.findById(it.product);
        productName = prod ? prod.name : it.product;
      } catch {
        productName = it.product;
      }
    }
    doc.text(`• ${it.quantity} × $${it.priceAtPurchase.toFixed(2)} (${productName})`);
  }
  doc.moveDown().text(`TOTAL: $${order.total.toFixed(2)}`);
  doc.end();
  await new Promise(resolve => writeStream.on('finish', resolve));
  console.log(`Generated invoice: ${filePath}`);
}

async function main() {
  await mongoose.connect(DB_URI);
  console.log('Connected to MongoDB');
  const orders = await Order.find().populate('user').populate('items.product');
  for (const order of orders) {
    const user = order.user || { name: 'Customer' };
    await generateInvoice(order, user);
  }
  await mongoose.disconnect();
  console.log('All invoices generated.');
}

main().catch(err => {
  console.error('Error generating invoices:', err);
  process.exit(1);
}); 