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
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    discountedPrice: {
      type: Number,
      default: null
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

// Calculate discounted price before saving
productSchema.pre('save', function(next) {
  if (this.discount > 0) {
    this.discountedPrice = this.price * (1 - this.discount / 100);
  } else {
    this.discountedPrice = null;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
