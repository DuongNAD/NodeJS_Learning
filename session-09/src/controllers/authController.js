const authService = require("../services/authService");

async function register(req, res) {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  me,
};
