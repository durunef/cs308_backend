const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');


exports.createProduct = catchAsync(async (req, res, next) => {
    // Gelen request body'den ürün verilerini alarak yeni bir ürün oluşturuyoruz.
    const newProduct = await Product.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  });


  
