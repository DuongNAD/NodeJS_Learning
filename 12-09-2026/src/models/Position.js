const mongoose = require("mongoose");
const { STATUS, STATUS_LIST } = require("../constant");

const positionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên chức vụ không được để trống"],
      trim: true
    },
    code: {
      type: String,
      required: [true, "Mã chức vụ không được để trống"],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    baseSalary: {
      type: Number,
      required: [true, "Lương cơ bản không được để trống"],
      min: [0, "Lương cơ bản phải lớn hơn hoặc bằng 0"]
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

const Position = mongoose.model("Position", positionSchema);

module.exports = Position;
