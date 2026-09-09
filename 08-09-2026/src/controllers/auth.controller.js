const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { ROLES, STATUS } = require("../constant");

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã được sử dụng"
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: role || ROLES.STAFF,
      status: status || STATUS.ACTIVE
    });

    res.status(201).json({
      message: "Đăng ký tài khoản thành công",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
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
        message: "Vui lòng nhập đầy đủ email và mật khẩu"
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không chính xác"
      });
    }

    if (user.status === STATUS.INACTIVE) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa"
      });
    }

    const token = generateToken({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Lấy thông tin tài khoản thành công",
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
