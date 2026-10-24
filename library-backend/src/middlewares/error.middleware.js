const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn không tồn tại: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi hệ thống',
  });
};

module.exports = {
  notFound,
  errorHandler,
};
