const User = require("../models/User");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    res.status(200).json({
      message: "Lấy thông tin hồ sơ cá nhân thành công",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const { fullName, phone, address, avatarUrl } = req.body;

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    if (address !== undefined) {
      user.address = address.trim();
    }
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl.trim();
    }

    await user.save();

    res.status(200).json({
      message: "Cập nhật hồ sơ cá nhân thành công",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: ["Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới"]
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới tối thiểu 6 ký tự"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu cũ không chính xác"
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
