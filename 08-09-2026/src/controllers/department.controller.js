const Department = require("../models/Department");
const Employee = require("../models/Employee");
const { STATUS, EMPLOYEE_STATUS } = require("../constant");

const getDepartments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const departments = await Department.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách phòng ban thành công",
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    res.status(200).json({
      message: "Lấy thông tin phòng ban thành công",
      data: department
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, status } = req.body;

    const existingDept = await Department.findOne({
      code: code ? code.trim().toUpperCase() : ""
    });
    if (existingDept) {
      return res.status(400).json({
        message: "Mã phòng ban đã tồn tại"
      });
    }

    const department = await Department.create({
      name,
      code,
      description,
      status: status || STATUS.ACTIVE
    });

    res.status(201).json({
      message: "Thêm phòng ban thành công",
      data: department
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, status } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    if (code && code.trim().toUpperCase() !== department.code) {
      const existingDept = await Department.findOne({
        code: code.trim().toUpperCase()
      });
      if (existingDept) {
        return res.status(400).json({
          message: "Mã phòng ban đã tồn tại"
        });
      }
      department.code = code.trim().toUpperCase();
    }

    if (name !== undefined) department.name = name;
    if (description !== undefined) department.description = description;
    if (status !== undefined) department.status = status;

    const updatedDepartment = await department.save();

    res.status(200).json({
      message: "Cập nhật phòng ban thành công",
      data: updatedDepartment
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const activeEmployees = await Employee.countDocuments({
      departmentId: req.params.id,
      status: { $in: [EMPLOYEE_STATUS.ACTIVE, EMPLOYEE_STATUS.PROBATION] }
    });

    if (activeEmployees > 0) {
      return res.status(400).json({
        message: "Không thể xóa phòng ban vẫn còn nhân viên đang hoạt động"
      });
    }

    department.status = STATUS.INACTIVE;
    await department.save();

    res.status(200).json({
      message: "Xóa phòng ban thành công (xóa mềm)",
      data: department
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
