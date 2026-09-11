const mongoose = require("mongoose");
const {
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_LIST,
  GENDERS,
  GENDER_LIST
} = require("../utils/constant");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Mã nhân viên không được để trống"],
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, "Họ tên không được để trống"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email không đúng định dạng"
      ]
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại không được để trống"],
      trim: true
    },
    gender: {
      type: String,
      required: [true, "Giới tính không được để trống"],
      enum: {
        values: GENDER_LIST,
        message: "Giới tính phải là một trong các giá trị: " + GENDER_LIST.join(", ")
      },
      default: GENDERS.MALE
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      type: String,
      trim: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Phòng ban không được để trống"]
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: [true, "Chức vụ không được để trống"]
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
    salary: {
      type: Number,
      required: [true, "Lương không được để trống"],
      min: [0, "Lương phải lớn hơn hoặc bằng 0"]
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: EMPLOYEE_STATUS_LIST,
        message: "Trạng thái phải là một trong các giá trị: " + EMPLOYEE_STATUS_LIST.join(", ")
      },
      default: EMPLOYEE_STATUS.PROBATION
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
