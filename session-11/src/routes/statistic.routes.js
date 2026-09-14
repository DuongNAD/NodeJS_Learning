const express = require("express");
const {
  getOverview,
  getDepartmentStats,
  getPositionStats
} = require("../controllers/statistic.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { ROLES } = require("../constant");

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.HR));

router.get("/overview", getOverview);
router.get("/departments", getDepartmentStats);
router.get("/positions", getPositionStats);

module.exports = router;
