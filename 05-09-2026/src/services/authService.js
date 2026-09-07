const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

async function registerUser({ name, email, password, role }) {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    name,
    email,
    password: hashedPassword,
  };
  if (role) {
    userData.role = role;
  }

  const user = await User.create(userData);

  return sanitizeUser(user);
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
