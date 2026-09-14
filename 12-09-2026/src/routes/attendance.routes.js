const express = require("express");
const {
  checkIn,
  checkOut,
  getAttendances,
  getMyAttendances,
  getEmployeeAttendances
} = require("../controllers/attendance.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { ROLES } = require("../utils/constant");

const router = express.Router();

router.use(protect);

router.post(
  "/check-in",
  authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF),
  checkIn
);

router.post(
  "/check-out",
  authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF),
  checkOut
);

router.get(
  "/me",
  authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF),
  getMyAttendances
);

router.get(
  "/employee/:employeeId",
  authorize(ROLES.ADMIN, ROLES.HR),
  getEmployeeAttendances
);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.HR),
  getAttendances
);

module.exports = router;
