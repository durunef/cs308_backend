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
      min: [0, 'Price cannot be negative'],
      default: null
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: null
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
    },
    published: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Calculate discounted price before saving
productSchema.pre('save', function(next) {
  if (this.price && this.discount > 0) {
    this.discountedPrice = this.price * (1 - this.discount / 100);
  } else {
    this.discountedPrice = null;
  }
  next();
});

// Add a method to check if product is ready for customer view
productSchema.methods.isReadyForCustomerView = function() {
  return this.price !== null && this.published;
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
