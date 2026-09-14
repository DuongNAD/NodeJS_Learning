const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ROLES, ROLE_LIST, STATUS, STATUS_LIST } = require("../constant");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Họ và tên không được để trống"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email không đúng định dạng"
      ]
    },
    password: {
      type: String,
      required: [true, "Mật khẩu không được để trống"],
      minlength: [6, "Mật khẩu tối thiểu 6 ký tự"]
    },
    role: {
      type: String,
      enum: {
        values: ROLE_LIST,
        message: `Vai trò chỉ nhận: ${ROLE_LIST.join(", ")}`
      },
      default: ROLES.STAFF
    },
    status: {
      type: String,
      enum: {
        values: STATUS_LIST,
        message: `Trạng thái chỉ nhận: ${STATUS_LIST.join(", ")}`
      },
      default: STATUS.ACTIVE
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
