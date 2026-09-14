const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện chức năng này"
      });
    }
    next();
  };
};

module.exports = { authorize };
