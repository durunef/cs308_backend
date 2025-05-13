const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a user']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Wishlist must contain a product']
    },
    notifyOnDiscount: {
      type: Boolean,
      default: true
    },
    lastNotifiedPrice: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure a user can't add the same product twice
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist; 