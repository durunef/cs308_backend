// models/userModel.js
const mongoose = require('mongoose');
const validator = require('validator');

// Şifreyi düz metin tutan basit şema
const userSchema = new mongoose.Schema({
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
    // Şifreyi düz metin olarak saklıyoruz, "select: false" da yok
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        // Kayıt sırasında password ile passwordConfirm eşleşiyor mu
        return el === this.password;
      },
      message: 'Passwords are not same!'
    }
  }
});

// Artık herhangi bir pre('save') veya bcrypt.hash yok!

const User = mongoose.model('User', userSchema);
module.exports = User;
