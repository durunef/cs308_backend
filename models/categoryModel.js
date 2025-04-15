const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true
        },
        description:
        {
            type:String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;



