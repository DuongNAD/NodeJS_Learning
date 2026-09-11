const mongoose = require("mongoose");
const {
  LEAVE_TYPES,
  LEAVE_TYPE_LIST,
  LEAVE_STATUS,
  LEAVE_STATUS_LIST
} = require("../utils/constant");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "ID nhân viên không được để trống"]
    },
    leaveType: {
      type: String,
      required: [true, "Loại nghỉ phép không được để trống"],
      enum: {
        values: LEAVE_TYPE_LIST,
        message: "Loại nghỉ phép phải là một trong các giá trị: " + LEAVE_TYPE_LIST.join(", ")
      }
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu nghỉ không được để trống"]
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc nghỉ không được để trống"]
    },
    reason: {
      type: String,
      required: [true, "Lý do nghỉ không được để trống"],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: LEAVE_STATUS_LIST,
        message: "Trạng thái đơn nghỉ phép không hợp lệ"
      },
      default: LEAVE_STATUS.PENDING
    }
  },
  {
    timestamps: true
  }
);

leaveSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
