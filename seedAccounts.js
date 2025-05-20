const mongoose = require('mongoose');
const User = require('./models/userModel');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');

// MongoDB connection string - update with your actual connection string
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Connect to MongoDB with better error handling
async function connectDB() {
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
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
    console.log('Cleared existing users and orders');
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

    const createdUser = await User.create(user);
    const createdManager = await User.create(productManager);
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
    const products = await Product.find().limit(8);
    
    if (products.length < 8) {
      throw new Error('Not enough products found in the database');
    }

    // Create orders with different statuses and dates
    const orders = [
      {
        user: userId,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            priceAtPurchase: products[0].price
          },
          {
            product: products[1]._id,
            quantity: 1,
            priceAtPurchase: products[1].price
          }
        ],
        total: products[0].price + products[1].price,
        status: 'delivered',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date('2024-04-10') // April 10, 2024
      },
      {
        user: userId,
        items: [
          {
            product: products[2]._id,
            quantity: 1,
            priceAtPurchase: products[2].price
          },
          {
            product: products[3]._id,
            quantity: 1,
            priceAtPurchase: products[3].price
          }
        ],
        total: products[2].price + products[3].price,
        status: 'delivered',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date('2024-05-29') // May 29, 2024
      },
      {
        user: userId,
        items: [
          {
            product: products[4]._id,
            quantity: 1,
            priceAtPurchase: products[4].price
          },
          {
            product: products[5]._id,
            quantity: 1,
            priceAtPurchase: products[5].price
          }
        ],
        total: products[4].price + products[5].price,
        status: 'processing',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date() // Current date
      },
      {
        user: userId,
        items: [
          {
            product: products[6]._id,
            quantity: 1,
            priceAtPurchase: products[6].price
          },
          {
            product: products[7]._id,
            quantity: 1,
            priceAtPurchase: products[7].price
          }
        ],
        total: products[6].price + products[7].price,
        status: 'in-transit',
        shippingAddress: {
          street: 'Üniversite St.',
          city: 'Tuzla/İstanbul',
          postalCode: '34000'
        },
        createdAt: new Date() // Current date
      }
    ];

    await Order.insertMany(orders);
    console.log('Orders created successfully');
  } catch (error) {
    console.error('Error creating orders:', error);
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