// controllers/authController.js
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');


// JWT oluşturma
const signToken = (userId, userEmail) => {
  return jwt.sign(
    { id: userId, email: userEmail }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' } // 1 saat geçerli
  );
};


// Kayıt (signup) fonksiyonu
exports.signup = catchAsync(async (req, res, next) => {
  // Doğrudan düz metin password kaydedilir
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id, newUser.email); 

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    },
    token
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

  //her şey yolundaysa token üretme
  const token = signToken(user._id, user.email);

  // Başarılı login
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully (no hashing)',
    token
  });

  




});
