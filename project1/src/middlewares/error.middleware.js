const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Không tìm thấy đường dẫn ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
