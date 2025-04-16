const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema(
    {
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Review must belong to a product']

        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true,'Review must belong to a user']
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
          },
          comment: {
            type: String,
            default: ''
          },
          approved: {
            type: Boolean,
            default: function() {
              return this.comment && this.comment.trim() !== '' ? false : true;
            }
          }
        }, {
          timestamps: true
        });
        
        const Review = mongoose.model('Review', reviewSchema);
        module.exports = Review;

  