const mongoose = require("mongoose");
const { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LIST } = require("../utils/constant");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "ID nhân viên không được để trống"]
    },
    date: {
      type: Date,
      required: [true, "Ngày chấm công không được để trống"]
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    workingHours: {
      type: Number,
      default: 0,
      min: [0, "Số giờ làm việc không thể âm"]
    },
    status: {
      type: String,
      enum: {
        values: ATTENDANCE_STATUS_LIST,
        message: "Trạng thái chấm công không hợp lệ"
      },
      default: ATTENDANCE_STATUS.PRESENT
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
