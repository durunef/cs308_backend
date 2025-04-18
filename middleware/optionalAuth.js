// middleware/optionalAuth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded; // Token geçerli ise, req.user'ı dolduruyoruz.
      }
      // Hata olsa bile veya token yoksa, sonraki middleware'e geçiyoruz.
      next();
    });
  } else {
    next(); // Authorization header yoksa direkt devam et.
  }
};
