const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtual populate: Bu alanda, ilgili ürünler (Product Model) category alanı ile eşleşiyor.
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Virtual alanların JSON çıktısında görünmesi için:
categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
