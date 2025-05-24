const mongoose = require('mongoose');
const User = require('./models/userModel');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// MongoDB connection string - update with your actual connection string
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Create invoices directory if it doesn't exist
const invoicesDir = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir);
}

// Function to generate PDF invoice
async function generateInvoice(order, user, products) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const invoicePath = path.join(invoicesDir, `invoice-${order._id}.pdf`);
      const writeStream = fs.createWriteStream(invoicePath);

      doc.pipe(writeStream);

      // Add content to PDF
      doc.fontSize(25).text('Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
      doc.text(`Customer: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      // Add items table
      doc.text('Items:', { underline: true });
      doc.moveDown();
      
      // Table header
      doc.text('Product', 50, doc.y, { width: 200 });
      doc.text('Quantity', 250, doc.y, { width: 100 });
      doc.text('Price', 350, doc.y, { width: 100 });
      doc.moveDown();

      // Table rows
      order.items.forEach(item => {
        const product = products.find(p => p._id.toString() === item.product.toString());
        doc.text(product ? product.name : 'Unknown Product', 50, doc.y, { width: 200 });
        doc.text(item.quantity.toString(), 250, doc.y, { width: 100 });
        doc.text(`$${item.priceAtPurchase.toFixed(2)}`, 350, doc.y, { width: 100 });
        doc.moveDown();
      });

      // Add total
      doc.moveDown();
      doc.text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });

      // Finalize PDF
      doc.end();

      writeStream.on('finish', () => {
        console.log(`Invoice generated for order ${order._id}`);
        resolve();
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Connect to MongoDB with better error handling
async function connectDB() {
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Please make sure MongoDB is running and accessible at:', DB_URI);
    process.exit(1);
  }
}

// Function to clear existing users and orders
async function clearExistingData() {
  try {
    console.log('Clearing existing users and orders...');
    await User.deleteMany({});
    await Order.deleteMany({});
    
    // Clear invoices directory
    if (fs.existsSync(invoicesDir)) {
      const files = fs.readdirSync(invoicesDir);
      for (const file of files) {
        fs.unlinkSync(path.join(invoicesDir, file));
      }
    }
    
    console.log('Cleared existing users, orders, and invoices');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
}

// Function to seed the user account
async function seedUser() {
  try {
    // Create regular user
    const user = {
      name: 'Duru Nef Özmen',
      email: 'duru.ozmen@sabanciuniv.edu',
      password: '111111',
      passwordConfirm: '111111',
      role: 'user',
      address: {
        street: 'Üniversite St.',
        city: 'Tuzla/İstanbul',
        postalCode: '34000'
      }
    };

    // Create product manager
    const productManager = {
      name: 'Product Manager',
      email: 'coffee@product.com',
      password: '111111',
      passwordConfirm: '111111',
      role: 'product-manager',
      address: {
        street: 'Product St.',
        city: 'Istanbul',
        postalCode: '34000'
      }
    };

    // Create sales manager
    const salesManager = {
      name: 'Sales Manager',
      email: 'coffee@sales.com',
      password: '111111',
      passwordConfirm: '111111',
      role: 'sales-manager',
      address: {
        street: 'Sales St.',
        city: 'Istanbul',
        postalCode: '34000'
      }
    };

    const createdUser = await User.create(user);
    const createdProductManager = await User.create(productManager);
    const createdSalesManager = await User.create(salesManager);
    
    console.log('Users created successfully');
    return createdUser._id;
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

// Function to create orders with different statuses and dates
async function seedOrders(userId) {
  try {
    // Get some products from the database
    const products = await Product.find().limit(5); // Changed to 5 since we need 5 products
    const user = await User.findById(userId);
    
    if (products.length < 5) {
      throw new Error('Not enough products found in the database');
    }

    // Create orders with different statuses and dates
    const orders = [
      {
        // Product E: purchased more than a month ago (10 april 2025) (status = delivered)
        user: userId,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            priceAtPurchase: products[0].price,
            costAtPurchase: products[0].price 
          }
        ],
        total: products[0].price,
        status: 'delivered',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date('2025-04-10')
      },
      {
        // Product F: purchased less than a month ago (20 may 2025) (status = delivered)
        user: userId,
        items: [
          {
            product: products[1]._id,
            quantity: 1,
            priceAtPurchase: products[1].price,
            costAtPurchase: products[1].price 
          }
        ],
        total: products[1].price,
        status: 'delivered',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date('2025-05-20')
      },
      {
        // Product G: purchased recently (status = processing)
        user: userId,
        items: [
          {
            product: products[2]._id,
            quantity: 1,
            priceAtPurchase: products[2].price,
            costAtPurchase: products[2].price
          }
        ],
        total: products[2].price,
        status: 'processing',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date() // Current date
      },
      {
        // Product H: purchased recently (status = in-transit)
        user: userId,
        items: [
          {
            product: products[3]._id,
            quantity: 1,
            priceAtPurchase: products[3].price,
            costAtPurchase: products[3].price 
          }
        ],
        total: products[3].price,
        status: 'in-transit',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date() // Current date
      },
      {
        // Additional product to meet the "at least five products" requirement
        user: userId,
        items: [
          {
            product: products[4]._id,
            quantity: 1,
            priceAtPurchase: products[4].price,
            costAtPurchase: products[4].price 
          }
        ],
        total: products[4].price,
        status: 'delivered',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date('2025-05-15') // Mid-May order
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log('Orders created successfully');

    // Generate invoices for each order
    for (const order of createdOrders) {
      await generateInvoice(order, user, products);
    }
    console.log('Invoices generated successfully');
  } catch (error) {
    console.error('Error creating orders or generating invoices:', error);
    process.exit(1);
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    await connectDB();
    await clearExistingData();
    const userId = await seedUser();
    await seedOrders(userId);
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 