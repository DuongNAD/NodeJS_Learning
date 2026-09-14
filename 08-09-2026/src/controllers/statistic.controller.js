const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Position = require("../models/Position");
const { STATUS, EMPLOYEE_STATUS } = require("../utils/constant");

const getOverview = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      probationEmployees,
      resignedEmployees,
      totalDepartments,
      totalPositions
    ] = await Promise.all([
      Employee.countDocuments({ status: { $ne: EMPLOYEE_STATUS.INACTIVE } }),
      Employee.countDocuments({ status: EMPLOYEE_STATUS.ACTIVE }),
      Employee.countDocuments({ status: EMPLOYEE_STATUS.PROBATION }),
      Employee.countDocuments({ status: EMPLOYEE_STATUS.RESIGNED }),
      Department.countDocuments({ status: { $ne: STATUS.INACTIVE } }),
      Position.countDocuments({ status: { $ne: STATUS.INACTIVE } })
    ]);

    res.status(200).json({
      message: "Lấy thống kê tổng quan thành công",
      data: {
        totalEmployees,
        activeEmployees,
        probationEmployees,
        resignedEmployees,
        totalDepartments,
        totalPositions
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = await Department.find({
      status: { $ne: STATUS.INACTIVE }
    }).select("name code");

    const counts = await Employee.aggregate([
      { $match: { status: { $ne: EMPLOYEE_STATUS.INACTIVE } } },
      { $group: { _id: "$departmentId", totalEmployees: { $sum: 1 } } }
    ]);

    const countMap = new Map(
      counts.map((c) => [c._id ? c._id.toString() : null, c.totalEmployees])
    );

    const data = departments.map((d) => ({
      departmentId: d._id,
      departmentName: d.name,
      departmentCode: d.code,
      totalEmployees: countMap.get(d._id.toString()) || 0
    }));

    res.status(200).json({
      message: "Lấy thống kê nhân viên theo phòng ban thành công",
      data
    });
  } catch (error) {
    next(error);
  }
};

const getPositionStats = async (req, res, next) => {
  try {
    const positions = await Position.find({
      status: { $ne: STATUS.INACTIVE }
    }).select("name code baseSalary");

    const counts = await Employee.aggregate([
      { $match: { status: { $ne: EMPLOYEE_STATUS.INACTIVE } } },
      { $group: { _id: "$positionId", totalEmployees: { $sum: 1 } } }
    ]);

    const countMap = new Map(
      counts.map((c) => [c._id ? c._id.toString() : null, c.totalEmployees])
    );

    const data = positions.map((p) => ({
      positionId: p._id,
      positionName: p.name,
      positionCode: p.code,
      totalEmployees: countMap.get(p._id.toString()) || 0
    }));

    res.status(200).json({
      message: "Lấy thống kê nhân viên theo chức vụ thành công",
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getDepartmentStats,
  getPositionStats
};
