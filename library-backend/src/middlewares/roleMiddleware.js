function roleMiddleware(...roles) {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action",
      });
    }
    next();
  };
}

module.exports = roleMiddleware;
