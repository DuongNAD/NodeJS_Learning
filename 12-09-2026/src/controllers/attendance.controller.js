const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { ROLES, ATTENDANCE_STATUS } = require("../utils/constant");
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

const checkIn = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
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

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Một nhân viên chỉ được check-in một lần trong một ngày"
      });
    }

    const attendance = await Attendance.create({
      employeeId: employee._id,
      date: now,
      checkIn: now,
      status: ATTENDANCE_STATUS.PRESENT
    });

    res.status(201).json({
      message: "Check-in thành công",
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
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

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        message: "Không được check-out nếu chưa check-in"
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Không được check-out nhiều lần trong cùng một ngày"
      });
    }

    attendance.checkOut = now;
    const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
    attendance.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    await attendance.save();

    res.status(200).json({
      message: "Check-out thành công",
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

const getAttendances = async (req, res, next) => {
  try {
    const { employeeId, fromDate, toDate } = req.query;
    const filter = {};

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.date.$lte = to;
      }
    }

    const { page, limit, skip } = getPagination(req.query);

    const [totalItems, attendances] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.find(filter)
        .populate("employeeId", "employeeCode fullName email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      message: "Lấy danh sách chấm công thành công",
      data: attendances,
      pagination: formatPaginationResponse(page, limit, totalItems)
    });
  } catch (error) {
    next(error);
  }
};

const getMyAttendances = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const { fromDate, toDate } = req.query;
    const filter = { employeeId: employee._id };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.date.$lte = to;
      }
    }

    const { page, limit, skip } = getPagination(req.query);

    const [totalItems, attendances] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.find(filter)
        .populate("employeeId", "employeeCode fullName email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      message: "Lấy danh sách chấm công của bản thân thành công",
      data: attendances,
      pagination: formatPaginationResponse(page, limit, totalItems)
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeAttendances = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu"
      });
    }

    const { fromDate, toDate } = req.query;
    const filter = { employeeId: employee._id };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.date.$lte = to;
      }
    }

    const { page, limit, skip } = getPagination(req.query);

    const [totalItems, attendances] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.find(filter)
        .populate("employeeId", "employeeCode fullName email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.status(200).json({
      message: "Lấy danh sách chấm công của nhân viên thành công",
      data: attendances,
      pagination: formatPaginationResponse(page, limit, totalItems)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendances,
  getMyAttendances,
  getEmployeeAttendances
};
