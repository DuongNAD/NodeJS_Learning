const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword
} = require("../controllers/profile.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getProfile)
  .put(updateProfile);

router
  .route("/change-password")
  .patch(changePassword);

module.exports = router;
