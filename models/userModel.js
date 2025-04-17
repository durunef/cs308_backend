const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 5
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not same!'
      }
    },
    address: {
      street: { type: String, default: ' ' },
      city: { type: String, default: ' ' },
      postalCode: { type: String, default: ' ' }
    },
    // Rol alanı: Email domainine göre admin atanacak; aksi halde varsayılan "user"
    role: {
      type: String,
      enum: ['user', 'product-manager', 'admin', 'delivery'],
      default: 'user'
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
