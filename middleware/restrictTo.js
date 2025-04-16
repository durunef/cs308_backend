module.exports = (...roles) => {
    return (req, res, next) => {
      // authMiddleware çalıştıktan sonra req.user içerisine role bilgisi yerleştirilmiş olmalı.
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to perform this action'
        });
      }
      next();
    };
  };
  