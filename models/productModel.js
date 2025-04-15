const mongoose = require('mongoose');

const productSchema  = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter the product name'],
        trim: true
    },

    model: {
        type:String,
        required: [true,'Please enter the product model'],
        trim: true
    },

    serialNumber: {
        type: String,
        required: [true,'Please enter the serial number'],
        unique: true,
        trim: true
    },

    description:
    {
        type: String,
        default: ''

    },

    quantityInStock:
    {
        type: Number,
        required: [true, 'Please provide quantity in stock'],
        min: [0, 'Quantity can not be negative'],

    },

    price:
    {
        type: Number,
        required: [true,'Please enter the price '],
        min : [0,'Price can not be negative']

    },

    warrantyStatus:
    {
        type: String,
        enum: ['valid', 'expired', 'none'],
        default: 'none'
    },

    distributorInfo: {
        type: String,
        required: [true, 'Please provide distributor information']
      }
    }, {
        timestamps: true // CreatedAt ve updatedAt alanlarını otomatik ekler
      });
      
      const Product = mongoose.model('Product', productSchema);
      module.exports = Product;

