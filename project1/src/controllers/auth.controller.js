const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        message: 'Email đã được sử dụng',
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};