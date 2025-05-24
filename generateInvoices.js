const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const Order = require('./models/orderModel');
const User = require('./models/userModel');
const Product = require('./models/productModel');

const DB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecommerce';
const invoicesDir = path.join(__dirname, 'invoices');

async function generateInvoice(order, user) {
  const filename = `invoice-${order._id}.pdf`;
  const filePath = path.join(invoicesDir, filename);

  // Skip if invoice already exists
  if (fs.existsSync(filePath)) {
    console.log(`Invoice already exists: ${filename}`);
    return;
  }

  console.log(`Generating invoice: ${filename}`);
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`Successfully generated: ${filename}`);
      resolve();
    });

    writeStream.on('error', (error) => {
      console.error(`Error generating ${filename}:`, error);
      reject(error);
    });

    doc.pipe(writeStream);

    // Add content to PDF
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${user.name}`);
    doc.moveDown();

    // Add items
    doc.text('Items:', { underline: true });
    doc.moveDown();

    order.items.forEach(item => {
      doc.text(`• ${item.quantity} × $${item.priceAtPurchase.toFixed(2)}`);
    });

    doc.moveDown();
    doc.text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });

    // Finalize PDF
    doc.end();
  });
}

async function main() {
  console.log('Ensuring invoices directory exists...');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
    console.log('Created invoices directory');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(DB_URI);
  console.log('Connected to MongoDB');

  try {
    const orders = await Order.find().populate('user');
    console.log(`Found ${orders.length} orders`);

    for (const order of orders) {
      try {
        await generateInvoice(order, order.user || { name: 'Customer' });
      } catch (error) {
        console.error(`Error generating invoice for order ${order._id}:`, error);
      }
    }

    console.log('Finished generating invoices');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
main().catch(console.error); 