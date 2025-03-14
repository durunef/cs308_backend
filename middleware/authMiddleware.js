// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1) Header'da Authorization var mı
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // 2) Token'ı ayır
  const token = authHeader.split(' ')[1];

  // 3) Doğrulama
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Token geçerliyse kullanıcı bilgilerini req.user’a koy
    req.user = decoded; // { id, email, iat, exp} vs.
    next();
  });
};
