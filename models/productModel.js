const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please provide product model']
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide serial number'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    quantityInStock: {
      type: Number,
      required: [true, 'Please provide quantity in stock'],
      min: [0, 'Quantity cannot be negative']
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    image: {
      type: String,
      default: '/images/default-product.jpg'
    },
    warrantyStatus: {
      type: String,
      enum: ['valid', 'expired', 'none'],
      default: 'none'
    },
    distributorInfo: {
      type: String,
      required: [true, 'Please provide distributor information']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a valid category']
    },
    type: {
      type: String,
      required: [true, 'Please provide product type']
    },
    subtype: {
      type: String,
      required: [true, 'Please provide product subtype']
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
