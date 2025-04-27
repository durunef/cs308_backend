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
      },
      
      // Additional coffee products
      {
        _id: "68000cef3a0b4f8159733b29",
        name: "Traditional Turkish Coffee",
        model: "TC-1001",
        serialNumber: "SN0011567890",
        description: "Authentic finely ground Turkish coffee with a rich, intense flavor profile and traditional preparation method.",
        quantityInStock: 22,
        price: 14.99,
        currency: "USD",
        image: "/images/turkish.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Istanbul Coffee Merchants",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Turkish",
        popularity: 85
      },
      {
        _id: "68000cef3a0b4f8159733b2a",
        name: "Cardamom Turkish Coffee",
        model: "TC-1002",
        serialNumber: "SN0012345678",
        description: "Traditional Turkish coffee infused with aromatic cardamom for a distinctive Middle Eastern flavor experience.",
        quantityInStock: 15,
        price: 16.99,
        currency: "USD",
        image: "/images/turkish_cardamom.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Istanbul Coffee Merchants",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Turkish",
        popularity: 78
      },
      {
        _id: "68000cef3a0b4f8159733b2b",
        name: "Mastic Turkish Coffee",
        model: "TC-1003",
        serialNumber: "SN0013456789",
        description: "Unique Turkish coffee blend with mastic gum, offering a pine-like aroma and distinctive taste.",
        quantityInStock: 10,
        price: 17.99,
        currency: "USD",
        image: "/images/turkish_mastic.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Istanbul Coffee Merchants",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Turkish",
        popularity: 72
      },
      {
        _id: "68000cef3a0b4f8159733b2c",
        name: "Copper Turkish Coffee Pot (Cezve)",
        model: "CP-2001",
        serialNumber: "SN0014567890",
        description: "Handcrafted copper coffee pot with wooden handle, designed specifically for preparing authentic Turkish coffee.",
        quantityInStock: 8,
        price: 39.99,
        currency: "USD",
        image: "/images/cezve.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Turkish Craftsmen Cooperative",
        category: categoryIds[2], // Electronics/Equipment category
        type: "Coffee Equipment",
        subtype: "Turkish Coffee Pot",
        popularity: 88
      },
      {
        _id: "68000cef3a0b4f8159733b2d",
        name: "Colombian Supremo",
        model: "CS-3001",
        serialNumber: "SN0015678901",
        description: "Premium Colombian beans with a well-balanced body, nutty undertones, and bright acidity.",
        quantityInStock: 25,
        price: 16.49,
        currency: "USD",
        image: "/images/colombian.jpg",
        warrantyStatus: "valid",
        distributorInfo: "South American Imports",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Single Origin",
        popularity: 82
      },
      {
        _id: "68000cef3a0b4f8159733b2e",
        name: "Jamaican Blue Mountain",
        model: "JB-3002",
        serialNumber: "SN0016789012",
        description: "Rare, luxury coffee from Jamaica's Blue Mountains, known for its mild flavor and lack of bitterness.",
        quantityInStock: 5,
        price: 49.99,
        currency: "USD",
        image: "/images/jamaican.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Caribbean Coffee Exports",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Single Origin",
        popularity: 95
      },
      {
        _id: "68000cef3a0b4f8159733b2f",
        name: "Chocolate Flavored Coffee",
        model: "CF-4001",
        serialNumber: "SN0017890123",
        description: "Smooth medium roast beans infused with rich chocolate flavors for a dessert-like coffee experience.",
        quantityInStock: 18,
        price: 14.49,
        currency: "USD",
        image: "/images/chocolate_coffee.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Flavor Masters Co.",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Flavored",
        popularity: 76
      },
      {
        _id: "68000cef3a0b4f8159733b30",
        name: "Hazelnut Flavored Coffee",
        model: "CF-4002",
        serialNumber: "SN0018901234",
        description: "Aromatic coffee beans with a sweet, nutty hazelnut flavor. A popular choice for flavored coffee lovers.",
        quantityInStock: 20,
        price: 14.49,
        currency: "USD",
        image: "/images/hazelnut.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Flavor Masters Co.",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Flavored",
        popularity: 78
      },
      {
        _id: "68000cef3a0b4f8159733b31",
        name: "Vanilla Flavored Coffee",
        model: "CF-4003",
        serialNumber: "SN0019012345",
        description: "Smooth coffee infused with sweet, creamy vanilla flavor. Perfect for a comforting cup.",
        quantityInStock: 22,
        price: 14.49,
        currency: "USD",
        image: "/images/vanilla.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Flavor Masters Co.",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Flavored",
        popularity: 74
      },
      {
        _id: "68000cef3a0b4f8159733b32",
        name: "Brazilian Santos",
        model: "BS-3003",
        serialNumber: "SN0020123456",
        description: "Smooth, mild coffee from Brazil with low acidity and notes of chocolate and nuts.",
        quantityInStock: 28,
        price: 15.49,
        currency: "USD",
        image: "/images/brazilian.jpg",
        warrantyStatus: "valid",
        distributorInfo: "South American Imports",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Single Origin",
        popularity: 80
      },
      {
        _id: "68000cef3a0b4f8159733b33",
        name: "Turkish Coffee Gift Set",
        model: "TG-5001",
        serialNumber: "SN0021234567",
        description: "Complete Turkish coffee experience with traditional coffee, copper cezve, and two porcelain cups.",
        quantityInStock: 12,
        price: 59.99,
        currency: "USD",
        image: "/images/turkish_set.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Istanbul Coffee Merchants",
        category: categoryIds[0], // Coffee category
        type: "Coffee Set",
        subtype: "Gift Set",
        popularity: 90
      },
      {
        _id: "68000cef3a0b4f8159733b34",
        name: "Caramel Turkish Coffee",
        model: "TC-1004",
        serialNumber: "SN0022345678",
        description: "Turkish coffee blend with sweet caramel notes, creating a unique fusion of traditional and modern flavors.",
        quantityInStock: 14,
        price: 16.99,
        currency: "USD",
        image: "/images/turkish_caramel.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Istanbul Coffee Merchants",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Turkish",
        popularity: 75
      },
      {
        _id: "68000cef3a0b4f8159733b35",
        name: "French Press",
        model: "FP-6001",
        serialNumber: "SN0023456789",
        description: "Classic glass and stainless steel French press for full-bodied, rich coffee. 34 oz capacity.",
        quantityInStock: 15,
        price: 29.99,
        currency: "USD",
        image: "/images/french_press.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Home Brewing Supplies",
        category: categoryIds[2], // Equipment category
        type: "Coffee Equipment",
        subtype: "Brewing",
        popularity: 84
      },
      {
        _id: "68000cef3a0b4f8159733b36",
        name: "Sumatra Mandheling",
        model: "SM-3004",
        serialNumber: "SN0024567890",
        description: "Earthy, full-bodied Indonesian coffee with low acidity and notes of chocolate and spice.",
        quantityInStock: 20,
        price: 17.99,
        currency: "USD",
        image: "/images/sumatra.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Pacific Coffee Traders",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Single Origin",
        popularity: 79
      },
      {
        _id: "68000cef3a0b4f8159733b37",
        name: "Decaf Colombian",
        model: "DC-7001",
        serialNumber: "SN0025678901",
        description: "Swiss Water Process decaffeinated Colombian coffee with full flavor and minimal caffeine.",
        quantityInStock: 15,
        price: 16.99,
        currency: "USD",
        image: "/images/decaf.jpg",
        warrantyStatus: "valid",
        distributorInfo: "South American Imports",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Decaf",
        popularity: 65
      },
      {
        _id: "68000cef3a0b4f8159733b38",
        name: "Light Roast Ethiopian",
        model: "LR-8001",
        serialNumber: "SN0026789012",
        description: "Delicate light roast with floral notes and bright acidity, showcasing Ethiopian beans' natural character.",
        quantityInStock: 18,
        price: 17.49,
        currency: "USD",
        image: "/images/light_roast.jpg",
        warrantyStatus: "valid",
        distributorInfo: "African Coffee Imports",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Light Roast",
        popularity: 72
      },
      {
        _id: "68000cef3a0b4f8159733b39",
        name: "Cold Brew Coffee Bags",
        model: "CB-9001",
        serialNumber: "SN0027890123",
        description: "Specially ground coffee in convenient bags for easy cold brewing. Makes smooth, low-acid coffee.",
        quantityInStock: 25,
        price: 12.99,
        currency: "USD",
        image: "/images/coldbrew.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Modern Coffee Co.",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Cold Brew",
        popularity: 88
      },
      {
        _id: "68000cef3a0b4f8159733b3a",
        name: "Porcelain Turkish Coffee Cups",
        model: "TC-6002",
        serialNumber: "SN0028901234",
        description: "Set of 6 handpainted porcelain Turkish coffee cups with saucers, traditional Ottoman design.",
        quantityInStock: 10,
        price: 34.99,
        currency: "USD",
        image: "/images/turkish_cups.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Turkish Craftsmen Cooperative",
        category: categoryIds[2], // Equipment category
        type: "Coffee Equipment",
        subtype: "Cups",
        popularity: 82
      },
      {
        _id: "68000cef3a0b4f8159733b3b",
        name: "Coffee Bean Sampler Pack",
        model: "SP-1001",
        serialNumber: "SN0029012345",
        description: "Tasting set with four 4-oz bags: Turkish, Colombian, Ethiopian, and Sumatra beans.",
        quantityInStock: 20,
        price: 24.99,
        currency: "USD",
        image: "/images/sampler.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Global Coffee Distributors",
        category: categoryIds[0], // Coffee category
        type: "Coffee Bean",
        subtype: "Sampler",
        popularity: 92
      },
      {
        _id: "68000cef3a0b4f8159733b3c",
        name: "Automatic Turkish Coffee Machine",
        model: "TM-6003",
        serialNumber: "SN0030123456",
        description: "Modern electric Turkish coffee maker with automatic brewing function and adjustable sweetness settings.",
        quantityInStock: 8,
        price: 129.99,
        currency: "USD",
        image: "/images/turkish_machine.jpg",
        warrantyStatus: "valid",
        distributorInfo: "Modern Kitchen Appliances",
        category: categoryIds[2], // Equipment category
        type: "Coffee Equipment",
        subtype: "Turkish Coffee Maker",
        popularity: 86
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
