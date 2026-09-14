const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );

      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Token không hợp lệ hoặc đã hết hạn"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Vui lòng đăng nhập để tiếp tục"
    });
  }
};

module.exports = { protect };
