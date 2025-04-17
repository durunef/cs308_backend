// controllers/orderController.js

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.createOrder = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // TODO: 1) Cart bilgisini alın (DB/cart, cookie, vs.)
  // const cart = await Cart.findOne({ user: userId });

  const cart = req.body.items; 
  // Şimdilik frontend’den { items: [ {product, quantity} ] } bekliyoruz.

  if (!cart || !cart.length) {
    return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
  }

  // 2) Stok kontrolü ve toplam tutarı hesaplama
  let total = 0;
  for (const item of cart) {
    const prod = await Product.findById(item.product);
    if (!prod) {
      return res.status(404).json({ status: 'fail', message: `Product ${item.product} not found` });
    }
    if (prod.quantityInStock < item.quantity) {
      return res.status(400).json({
        status: 'fail',
        message: `Not enough stock for product ${prod.name}`
      });
    }
    total += prod.price * item.quantity;
  }

  // 3) Stokları güncelle
  for (const item of cart) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantityInStock: -item.quantity }
    }, { new: true });
  }

  // 4) Order oluştur
  const newOrder = await Order.create({
    user: userId,
    items: cart.map(i => ({ product: i.product, quantity: i.quantity, price: i.price })),
    totalAmount: total
  });

  // TODO: 5) Delivery departmanına siparişi ilet (webhook / message queue)
  // await deliveryService.forwardOrder(newOrder);

  res.status(201).json({
    status: 'success',
    data: { order: newOrder }
  });
});

exports.getOrderHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const orders = await Order.find({ user: userId })
    .populate('items.product', 'name price') // ürün adı ve fiyatı çek
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: { orders }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // TODO: Yalnızca admin veya delivery rolü erişsin
  const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ status: 'fail', message: 'Order not found' });
  }
  res.status(200).json({ status: 'success', data: { order: updated } });
});
