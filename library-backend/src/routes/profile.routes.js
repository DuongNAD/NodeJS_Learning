const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/profile.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

module.exports = router;
