// controllers/authController.js
const User = require('./../models/userModel');
const Cart = require('./../models/cartModel');      // ← Cart model’i eklendi
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

// Login fonksiyonu (guest sepetteki ürünleri merge edecek şekilde güncellendi)
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, cartId: guestCartIdFromBody } = req.body;
  const guestCartIdFromHeader = req.headers.cartid;

  // Email ve şifre kontrolü
  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password!'
    });
  }

  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password'
    });
  }

  // Token üretimi
  const token = signToken(user._id, user.email);

  // Guest sepetin user sepetine merge edilmesi
  const guestCartId = guestCartIdFromHeader || guestCartIdFromBody;
  if (guestCartId) {
    const guestCart = await Cart.findById(guestCartId);
    if (guestCart && guestCart.items.length > 0) {
      let userCart = await Cart.findOne({ user: user._id });
      if (!userCart) {
        userCart = await Cart.create({ user: user._id, items: [] });
      }
      for (const guestItem of guestCart.items) {
        const idx = userCart.items.findIndex(
          i => i.product.toString() === guestItem.product.toString()
        );
        if (idx > -1) {
          userCart.items[idx].quantity += guestItem.quantity;
        } else {
          userCart.items.push({
            product: guestItem.product,
            quantity: guestItem.quantity
          });
        }
      }
      await userCart.save();
      // İsteğe bağlı: guest sepeti silebilirsiniz
      await Cart.findByIdAndDelete(guestCartId);
    }
  }

  // Başarılı login yanıtı
  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully, and any guest cart merged!',
    token
  });
});
