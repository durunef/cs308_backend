// controllers/authController.js
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// Kayıt (signup) fonksiyonu
exports.signup = catchAsync(async (req, res, next) => {
  // Doğrudan düz metin password kaydedilir
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

// Login fonksiyonu
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Email ve şifre gönderildi mi kontrol et
  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password!'
    });
  }

  // Düz metin şifre olduğu için .select('+password') vb. yok
  const user = await User.findOne({ email });

  // Kullanıcı yok veya şifre eşleşmiyorsa
  if (!user || user.password !== password) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password'
    });
  }

  // Başarılı login
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully (no hashing, no JWT yet)'
  });
});
