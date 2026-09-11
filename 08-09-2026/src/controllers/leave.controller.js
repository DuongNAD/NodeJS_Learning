const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const { ROLES, LEAVE_STATUS } = require("../utils/constant");
const { getPagination, formatPaginationResponse } = require("../utils/pagination");

const getTargetEmployee = async (req, employeeId) => {
  let targetId = employeeId;
  if (!targetId && req.user && req.user.role === ROLES.STAFF) {
    const emp = await Employee.findOne({ email: req.user.email });
    return emp;
  }
  if (!targetId) {
    return null;
  }
  const employee = await Employee.findById(targetId);
  if (!employee) {
    return null;
  }
  if (req.user && req.user.role === ROLES.STAFF && employee.email !== req.user.email) {
    return "FORBIDDEN";
  }
  return employee;
};

const createLeave = async (req, res, next) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;
    const employee = await getTargetEmployee(req, employeeId);

    if (employee === "FORBIDDEN") {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện chức năng này"
      });
    }

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Ngày bắt đầu và ngày kết thúc không được để trống"
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: LEAVE_STATUS.PENDING
    });

    res.status(201).json({
      message: "Gửi đơn nghỉ phép thành công",
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const { employeeId, status, leaveType } = req.query;
    const filter = {};

    if (employeeId) {
      filter.employeeId = employeeId;
    }
    if (status) {
      filter.status = status;
    }
    if (leaveType) {
      filter.leaveType = leaveType;
    }

    const { page, limit, skip } = getPagination(req.query);

    const [totalItems, leaves] = await Promise.all([
      Leave.countDocuments(filter),
      Leave.find(filter)
        .populate("employeeId", "employeeCode fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      message: "Lấy danh sách đơn nghỉ phép thành công",
      data: leaves,
      pagination: formatPaginationResponse(page, limit, totalItems)
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const { status, leaveType } = req.query;
    const filter = { employeeId: employee._id };

    if (status) {
      filter.status = status;
    }
    if (leaveType) {
      filter.leaveType = leaveType;
    }

    const { page, limit, skip } = getPagination(req.query);

    const [totalItems, leaves] = await Promise.all([
      Leave.countDocuments(filter),
      Leave.find(filter)
        .populate("employeeId", "employeeCode fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      message: "Lấy danh sách đơn nghỉ phép của bản thân thành công",
      data: leaves,
      pagination: formatPaginationResponse(page, limit, totalItems)
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate(
      "employeeId",
      "employeeCode fullName email"
    );

    if (!leave) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    if (
      req.user &&
      req.user.role === ROLES.STAFF &&
      leave.employeeId &&
      leave.employeeId.email !== req.user.email
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện chức năng này"
      });
    }

    res.status(200).json({
      message: "Lấy chi tiết đơn nghỉ phép thành công",
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

const approveLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({
        message: "Không thể duyệt đơn nghỉ phép đã được xử lý"
      });
    }

    leave.status = LEAVE_STATUS.APPROVED;
    await leave.save();

    res.status(200).json({
      message: "Duyệt đơn nghỉ phép thành công",
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

const rejectLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({
        message: "Không thể từ chối đơn nghỉ phép đã được xử lý"
      });
    }

    leave.status = LEAVE_STATUS.REJECTED;
    await leave.save();

    res.status(200).json({
      message: "Từ chối đơn nghỉ phép thành công",
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeave,
  getLeaves,
  getMyLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave
};
