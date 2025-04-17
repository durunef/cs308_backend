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
    const { cartId } = req.query;
    if (!cartId) {
      return res
        .status(400)
        .json({ status: 'fail', message: "Cart not provided. For guest users, send cartId or create a new cart." });
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
    return res
      .status(400)
      .json({ status: 'fail', message: "Product id and quantity must be provided" });
  }

  // 1) Ürünün varlığını ve stok bilgisini al
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ status: 'fail', message: "Product not found" });
  }

  // 2) Mevcut sepeti getir
  let cart;
  if (req.user) {
    cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
  } else {
    const cartId = req.headers.cartid || req.body.cartId;
    if (cartId) cart = await Cart.findById(cartId);
    if (!cart) cart = await Cart.create({ items: [] });
  }

  // 3) Sepette zaten bu üründen kaç adet var?
  const existingItem = cart.items.find(item => item.product.toString() === productId);
  const currentQty = existingItem ? existingItem.quantity : 0;

  // 4) Stok kontrolü: eklenmek istenen + mevcut <= stok mu?
  if (currentQty + quantity > product.quantityInStock) {
    return res.status(400).json({
      status: 'fail',
      message: `Only ${product.quantityInStock - currentQty} item(s) left in stock`
    });
  }

  // 5) Sepeti güncelle
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();

  // 6) Yanıt: eğer guest ise yeni cartId de dönüyoruz
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
    return res
      .status(400)
      .json({ status: 'fail', message: "Product id must be provided" });
  }

  let cart;
  if (req.user) {
    cart = await Cart.findOne({ user: req.user.id });
  } else {
    const cartId = req.headers.cartid || req.body.cartId;
    if (!cartId) {
      return res
        .status(400)
        .json({ status: 'fail', message: "No cart provided for guest user" });
    }
    cart = await Cart.findById(cartId);
  }

  if (!cart) {
    return res.status(404).json({ status: 'fail', message: "Cart not found" });
  }

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  res.status(200).json({ status: 'success', data: cart });
});
