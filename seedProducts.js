const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

// MongoDB connection string - update with your actual connection string
const DB_URI = 'mongodb://localhost:27017/ecommerce';

// Connect to MongoDB
mongoose.connect(DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to clear existing products
async function clearProducts() {
  try {
    console.log('Clearing existing products...');
    const result = await Product.deleteMany({});
    console.log(`Cleared ${result.deletedCount} products from database`);
  } catch (error) {
    console.error('Error clearing products:', error);
    process.exit(1);
  }
}

// Function to seed categories
async function seedCategories() {
  try {
    // Check if categories already exist
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount > 0) {
      console.log('Categories already exist. Skipping category seeding.');
      return [
        "67febefa24a0a851f38ba243", // Coffee
        "67febefa24a0a851f38ba244", // Tea
        "67febefa24a0a851f38ba245"  // Electronics
      ];
    }

    // Create categories
    const categories = [
      {
        _id: "67febefa24a0a851f38ba243",
        name: "Coffee",
        description: "Various coffee products including beans and ground coffee."
      },
      {
        _id: "67febefa24a0a851f38ba244",
        name: "Tea",
        description: "Premium tea products from around the world."
      },
      {
        _id: "67febefa24a0a851f38ba245",
        name: "Electronics",
        description: "Electronic devices and accessories."
      }
    ];

    await Category.insertMany(categories);
    console.log('Categories seeded successfully');
    
    return categories.map(cat => cat._id);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Function to seed products
async function seedProducts(categoryIds) {
  try {
    console.log('Checking and updating products...');

    // Define the products we want to ensure exist
    const products = [
      // Coffee Beans Products
      {
        _id: "68000cef3a0b4f8159733b1f",
        name: "Arabica Coffee Beans",
        model: "AB-2024",
        serialNumber: "SN0001233990",
        description: "Smooth and flavorful Arabica beans from Ethiopia. Known for their sweet, fruity notes and balanced acidity.",
        quantityInStock: 0,  // Product A - out of stock
        price: 15.99,
        currency: "USD",
        image: "/images/arabica.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Global Coffee Distributors",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Arabica",
        popularity: 60
      },
      {
        _id: "68000cef3a0b4f8159733b20",
        name: "Robusta Coffee Beans",
        model: "RB-2024",
        serialNumber: "SN0002456781",
        description: "Bold and strong Robusta beans with higher caffeine content. Perfect for espresso blends.",
        quantityInStock: 1,  // Product B - only one in stock
        price: 12.99,
        currency: "USD",
        image: "/images/robusta.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Premium Coffee Suppliers",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Robusta",
        popularity: 45
      },
      {
        _id: "68000cef3a0b4f8159733b21",
        name: "Ethiopian Yirgacheffe",
        model: "EY-2024",
        serialNumber: "SN0003789012",
        description: "Exotic Ethiopian Yirgacheffe with distinctive floral and citrus notes. A specialty coffee lover's delight.",
        quantityInStock: 15,  // Product C - more than one in stock
        price: 18.99,
        currency: "USD",
        image: "/images/ethiopian.jpg",
        warrantyStatus: "valid",
        distributorInfo: "African Coffee Imports",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Single Origin",
        popularity: 75
      },
      {
        _id: "68000cef3a0b4f8159733b22",
        name: "Organic Fair Trade Blend",
        model: "OF-2024",
        serialNumber: "SN0004123456",
        description: "Ethically sourced organic beans from sustainable farms. Balanced flavor with chocolate and nutty undertones.",
        quantityInStock: 25,
        price: 16.49,
        currency: "USD",
        image: "/images/organic.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Eco Coffee Co.",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Organic",
        popularity: 80
      },
      {
        _id: "68000cef3a0b4f8159733b23",
        name: "Dark Roast Espresso Blend",
        model: "DR-2024",
        serialNumber: "SN0005654321",
        description: "Rich, intense dark roast designed specifically for espresso. Features smoky notes with a hint of caramel.",
        quantityInStock: 18,
        price: 14.99,
        currency: "USD",
        image: "/images/dark_roast.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Italian Coffee Specialists",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Dark Roast",
        popularity: 65
      },
      {
        _id: "68000cef3a0b4f8159733b24",
        name: "Medium Roast Breakfast Blend",
        model: "MR-2024",
        serialNumber: "SN0006987654",
        description: "Perfectly balanced medium roast with bright acidity and a smooth finish. Ideal for morning brewing.",
        quantityInStock: 30,
        price: 13.99,
        currency: "USD",
        image: "/images/medium_roast.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Morning Brews Inc.",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Medium Roast",
        popularity: 70
      },
      
      // Coffee-related Electronics
      {
        _id: "68000cef3a0b4f8159733b25",
        name: "Professional Espresso Machine",
        model: "EM-5000",
        serialNumber: "SN0007123789",
        description: "Commercial-grade espresso machine with 15-bar pressure pump, dual boiler system, and programmable shot controls.",
        quantityInStock: 5,
        price: 699.99,
        currency: "USD",
        image: "/images/welcome.jpg", // Placeholder image
        warrantyStatus: "valid",
        distributorInfo: "Cafe Electronics Ltd.",
        category: categoryIds[2], // Electronics category
        type: "Coffee Equipment",
        subtype: "Espresso Machine",
        popularity: 90
      },
      {
        _id: "68000cef3a0b4f8159733b26",
        name: "Burr Coffee Grinder",
        model: "CG-200",
        serialNumber: "SN0008456123",
        description: "Precision burr grinder with 40 grind settings for perfect consistency from espresso to French press.",
        quantityInStock: 0, // Out of stock
        price: 149.99,
        currency: "USD",
        image: "/images/welcome.jpg", // Placeholder image
        warrantyStatus: "valid",
        distributorInfo: "Kitchen Innovations",
        category: categoryIds[2], // Electronics category
        type: "Coffee Equipment",
        subtype: "Grinder",
        popularity: 85
      },
      {
        _id: "68000cef3a0b4f8159733b27",
        name: "Smart Coffee Maker",
        model: "SCM-100",
        serialNumber: "SN0009789456",
        description: "Wi-Fi enabled drip coffee maker with smartphone control, programmable brewing, and temperature adjustment.",
        quantityInStock: 1, // Only one in stock
        price: 129.99,
        currency: "USD",
        image: "/images/welcome.jpg", // Placeholder image
        warrantyStatus: "valid",
        distributorInfo: "Smart Home Appliances",
        category: categoryIds[2], // Electronics category
        type: "Coffee Equipment",
        subtype: "Coffee Maker",
        popularity: 95
      },
      {
        _id: "68000cef3a0b4f8159733b28",
        name: "Electric Milk Frother",
        model: "MF-50",
        serialNumber: "SN0010321654",
        description: "Automatic milk frother with hot and cold frothing options for cappuccinos, lattes, and more.",
        quantityInStock: 12,
        price: 59.99,
        currency: "USD",
        image: "/images/welcome.jpg", // Placeholder image
        warrantyStatus: "valid",
        distributorInfo: "Barista Essentials",
        category: categoryIds[2], // Electronics category
        type: "Coffee Equipment",
        subtype: "Milk Frother",
        popularity: 75
      }
    ];

    // Process each product
    for (const product of products) {
      // Try to find if a product with this serial number already exists
      const existingProduct = await Product.findOne({ serialNumber: product.serialNumber });
      
      if (existingProduct) {
        console.log(`Product with serialNumber ${product.serialNumber} already exists. Updating...`);
        // Update the existing product with our specified _id
        await Product.findByIdAndUpdate(
          existingProduct._id, 
          { ...product, _id: existingProduct._id }, // Keep the existing _id 
          { new: true }
        );
      } else {
        // Insert as a new product
        console.log(`Adding new product: ${product.name}`);
        await Product.create(product);
      }
    }

    console.log('Products updated/created successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seeding functions
async function seedDatabase() {
  try {
    // First clear existing products
    await clearProducts();
    
    const categoryIds = await seedCategories();
    await seedProducts(categoryIds);
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
