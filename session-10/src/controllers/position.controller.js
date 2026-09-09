const Position = require("../models/Position");
const { STATUS } = require("../constant");

const getPositions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const positions = await Position.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách chức vụ thành công",
      data: positions
    });
  } catch (error) {
    next(error);
  }
};

const getPositionById = async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    res.status(200).json({
      message: "Lấy thông tin chức vụ thành công",
      data: position
    });
  } catch (error) {
    next(error);
  }
};

const createPosition = async (req, res, next) => {
  try {
    const { name, code, description, baseSalary, status } = req.body;

    const existingPos = await Position.findOne({
      code: code ? code.trim().toUpperCase() : ""
    });
    if (existingPos) {
      return res.status(400).json({
        message: "Mã chức vụ đã tồn tại"
      });
    }

    const position = await Position.create({
      name,
      code,
      description,
      baseSalary,
      status: status || STATUS.ACTIVE
    });

    res.status(201).json({
      message: "Thêm chức vụ thành công",
      data: position
    });
  } catch (error) {
    next(error);
  }
};

const updatePosition = async (req, res, next) => {
  try {
    const { name, code, description, baseSalary, status } = req.body;
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    if (code && code.trim().toUpperCase() !== position.code) {
      const existingPos = await Position.findOne({
        code: code.trim().toUpperCase()
      });
      if (existingPos) {
        return res.status(400).json({
          message: "Mã chức vụ đã tồn tại"
        });
      }
      position.code = code.trim().toUpperCase();
    }

    if (name !== undefined) position.name = name;
    if (description !== undefined) position.description = description;
    if (baseSalary !== undefined) position.baseSalary = baseSalary;
    if (status !== undefined) position.status = status;

    const updatedPosition = await position.save();

    res.status(200).json({
      message: "Cập nhật chức vụ thành công",
      data: updatedPosition
    });
  } catch (error) {
    next(error);
  }
};

const deletePosition = async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);

    if (!position) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    position.status = STATUS.INACTIVE;
    await position.save();

    res.status(200).json({
      message: "Xóa chức vụ thành công (xóa mềm)",
      data: position
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
};
