const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Position = require("../models/Position");
const { EMPLOYEE_STATUS } = require("../utils/constant");
const { getPagination, formatPaginationResponse } = require("../utils/pagination");

const getEmployees = async (req, res, next) => {
  try {
    const {
      keyword,
      departmentId,
      positionId,
      status,
      gender,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    const filter = {};

    if (keyword) {
      const regex = new RegExp(keyword.trim(), "i");
      filter.$or = [
        { employeeCode: regex },
        { fullName: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    if (departmentId) filter.departmentId = departmentId;
    if (positionId) filter.positionId = positionId;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;

    const { page, limit, skip } = getPagination(req.query);

    const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [totalItems, employees] = await Promise.all([
      Employee.countDocuments(filter),
      Employee.find(filter)
        .populate("departmentId", "name code status")
        .populate("positionId", "name code baseSalary status")
        .populate("managerId", "employeeCode fullName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      message: "Lấy danh sách nhân viên thành công",
      data: employees,
      pagination: formatPaginationResponse(page, limit, totalItems)
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("departmentId", "name code status description")
      .populate("positionId", "name code baseSalary status description")
      .populate("managerId", "employeeCode fullName email phone");

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    res.status(200).json({
      message: "Lấy thông tin nhân viên thành công",
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeCode,
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      departmentId,
      positionId,
      managerId,
      salary,
      startDate,
      status
    } = req.body;

    if (employeeCode) {
      const existingCode = await Employee.findOne({ employeeCode: employeeCode.trim() });
      if (existingCode) {
        return res.status(400).json({
          message: "Mã nhân viên đã tồn tại"
        });
      }
    }

    if (email) {
      const existingEmail = await Employee.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email nhân viên đã tồn tại"
        });
      }
    }

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({
          message: "Phòng ban không tồn tại"
        });
      }
    }

    if (positionId) {
      const position = await Position.findById(positionId);
      if (!position) {
        return res.status(400).json({
          message: "Chức vụ không tồn tại"
        });
      }
    }

    if (managerId) {
      const manager = await Employee.findById(managerId);
      if (!manager) {
        return res.status(400).json({
          message: "Người quản lý trực tiếp không tồn tại"
        });
      }
    }

    const employee = await Employee.create({
      employeeCode,
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      departmentId,
      positionId,
      managerId: managerId || null,
      salary,
      startDate,
      status
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate("departmentId", "name code")
      .populate("positionId", "name code baseSalary")
      .populate("managerId", "employeeCode fullName email");

    res.status(201).json({
      message: "Thêm nhân viên thành công",
      data: populatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const {
      employeeCode,
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      departmentId,
      positionId,
      managerId,
      salary,
      startDate,
      status
    } = req.body;

    if (employeeCode && employeeCode.trim() !== employee.employeeCode) {
      const existingCode = await Employee.findOne({
        employeeCode: employeeCode.trim(),
        _id: { $ne: employee._id }
      });
      if (existingCode) {
        return res.status(400).json({
          message: "Mã nhân viên đã tồn tại"
        });
      }
      employee.employeeCode = employeeCode.trim();
    }

    if (email && email.toLowerCase().trim() !== employee.email) {
      const existingEmail = await Employee.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: employee._id }
      });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email nhân viên đã tồn tại"
        });
      }
      employee.email = email.toLowerCase().trim();
    }

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({
          message: "Phòng ban không tồn tại"
        });
      }
      employee.departmentId = departmentId;
    }

    if (positionId) {
      const position = await Position.findById(positionId);
      if (!position) {
        return res.status(400).json({
          message: "Chức vụ không tồn tại"
        });
      }
      employee.positionId = positionId;
    }

    if (managerId !== undefined) {
      if (managerId) {
        if (managerId.toString() === employee._id.toString()) {
          return res.status(400).json({
            message: "Nhân viên không thể tự làm người quản lý của chính mình"
          });
        }
        const manager = await Employee.findById(managerId);
        if (!manager) {
          return res.status(400).json({
            message: "Người quản lý trực tiếp không tồn tại"
          });
        }
        employee.managerId = managerId;
      } else {
        employee.managerId = null;
      }
    }

    if (fullName !== undefined) employee.fullName = fullName.trim();
    if (phone !== undefined) employee.phone = phone.trim();
    if (gender !== undefined) employee.gender = gender;
    if (dateOfBirth !== undefined) employee.dateOfBirth = dateOfBirth;
    if (address !== undefined) employee.address = address;
    if (salary !== undefined) employee.salary = salary;
    if (startDate !== undefined) employee.startDate = startDate;
    if (status !== undefined) employee.status = status;

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate("departmentId", "name code")
      .populate("positionId", "name code baseSalary")
      .populate("managerId", "employeeCode fullName email");

    res.status(200).json({
      message: "Cập nhật thông tin nhân viên thành công",
      data: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    employee.status = EMPLOYEE_STATUS.INACTIVE;
    await employee.save();

    res.status(200).json({
      message: "Xóa nhân viên thành công (xóa mềm)",
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
