const notFound = (req, res, next) => {
  res.status(404).json({
    message: "Không tìm thấy dữ liệu"
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(statusCode).json({
      message: "Dữ liệu không hợp lệ",
      errors
    });
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    return res.status(statusCode).json({
      message: "Dữ liệu không hợp lệ",
      errors: [`Trường ${field} đã tồn tại trong hệ thống`]
    });
  }

  if (err.name === "CastError") {
    statusCode = 400;
    return res.status(statusCode).json({
      message: "Định dạng ID không hợp lệ"
    });
  }

  res.status(statusCode).json({
    message: err.message || "Lỗi máy chủ nội bộ"
  });
};

module.exports = { notFound, errorHandler };
