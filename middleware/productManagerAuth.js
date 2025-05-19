// middleware/productManagerAuth.js
const catchAsync = require('../utils/catchAsync')

// Bu middleware, `protect` ile kimliği doğrulanmış kullanıcının
// rolünün “product-manager” olup olmadığını kontrol eder.
function restrictToProductManager(req, res, next) {
  // authMiddleware’ın eklediği req.user’da rol bilgisi bekliyoruz
  if (!req.user || req.user.role !== 'product-manager') {
    return res.status(403).json({
      status: 'fail',
      message: 'You do not have permission to access this resource.'
    })
  }
  next()
}

// CommonJS export
module.exports = {
  restrictToProductManager
}
