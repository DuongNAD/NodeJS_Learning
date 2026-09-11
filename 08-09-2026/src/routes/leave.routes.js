const express = require("express");
const {
  createLeave,
  getLeaves,
  getMyLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave
} = require("../controllers/leave.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { ROLES } = require("../utils/constant");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF),
  createLeave
);

router.get(
  "/me",
  authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF),
  getMyLeaves
);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.HR),
  getLeaves
);

router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF),
  getLeaveById
);

router.patch(
  "/:id/approve",
  authorize(ROLES.ADMIN, ROLES.HR),
  approveLeave
);

router.patch(
  "/:id/reject",
  authorize(ROLES.ADMIN, ROLES.HR),
  rejectLeave
);

module.exports = router;
