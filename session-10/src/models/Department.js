const mongoose = require("mongoose");
const { STATUS, STATUS_LIST } = require("../constant");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên phòng ban không được để trống"],
      trim: true
    },
    code: {
      type: String,
      required: [true, "Mã phòng ban không được để trống"],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: {
        values: STATUS_LIST,
        message: `Trạng thái chỉ nhận: ${STATUS_LIST.join(", ")}`
      },
      default: STATUS.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
