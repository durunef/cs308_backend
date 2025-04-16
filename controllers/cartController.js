// controllers/cartController.js

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/cart
 * Sepet bilgisini getirir.
 * - Oturumlu kullanıcılar: req.user.id üzerinden sepet aranır.
 * - Oturumsuz kullanıcılar: Query parametresi olarak gönderilen cartId kullanılır.
 */
exports.getCart = catchAsync(async (req, res, next) => {
  let cart;
  if (req.user) {
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  } else {
    // Oturumsuz kullanıcı: cartId query parametresi beklenir.
    const { cartId } = req.query;
    if (!cartId) {
      return res.status(400).json({ status: 'fail', message: "Cart not provided. For guest users, send cartId or create a new cart." });
    }
    cart = await Cart.findById(cartId).populate('items.product');
  }
  if (!cart) {
    return res.status(404).json({ status: 'fail', message: "Cart not found" });
  }
  res.status(200).json({ status: 'success', data: cart });
});

/**
 * POST /api/cart/add
 * Sepete ürün ekler.
 * Beklenen payload: { productId: String, quantity: Number }
 * - Oturumlu kullanıcı: req.user üzerinden sepet aranır veya oluşturulur.
 * - Oturumsuz kullanıcı: Headers veya body üzerinden gönderilen cartId ile sepet aranır, yoksa yeni guest sepet oluşturulur.
 */
exports.addItemToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ status: 'fail', message: "Product id and quantity must be provided" });
  }
  // Ürünün varlığını kontrol ediyoruz.
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ status: 'fail', message: "Product not found" });
  }
  
  let cart;
  if (req.user) {
    // Oturumlu kullanıcı: kullanıcının sepetini bul veya oluştur.
    cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
  } else {
    // Oturumsuz kullanıcı: Headers veya body'de gönderilen cartId kullanılır.
    let cartId = req.headers.cartid || req.body.cartId;
    if (cartId) {
      cart = await Cart.findById(cartId);
    }
    if (!cart) {
      // Yeni guest sepet oluşturuluyor.
      cart = await Cart.create({ items: [] });
    }
  }
  
  // Ürün zaten sepette varsa miktarı güncellenir, yoksa eklenir.
  const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  
  // Eğer oturum açmamışsa, yeni oluşturulan guest sepetin ID'si de yanıt içerisinde gönderilir.
  res.status(200).json({ status: 'success', data: cart });
});

/**
 * POST /api/cart/remove
 * Sepetten bir ürünü çıkarır.
 * Beklenen payload: { productId: String }
 * - Oturumlu kullanıcı: req.user üzerinden sepet aranır.
 * - Oturumsuz kullanıcı: Headers veya body üzerinden gönderilen cartId ile sepet aranır.
 */
exports.removeItemFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ status: 'fail', message: "Product id must be provided" });
  }
  
  let cart;
  if (req.user) {
    cart = await Cart.findOne({ user: req.user.id });
  } else {
    // Oturumsuz kullanıcı: cartId, headers veya body'de gönderilmeli.
    let cartId = req.headers.cartid || req.body.cartId;
    if (!cartId) {
      return res.status(400).json({ status: 'fail', message: "No cart provided for guest user" });
    }
    cart = await Cart.findById(cartId);
  }
  
  if (!cart) {
    return res.status(404).json({ status: 'fail', message: "Cart not found" });
  }
  
  // İlgili ürünü sepetten çıkarıyoruz.
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  res.status(200).json({ status: 'success', data: cart });
});
