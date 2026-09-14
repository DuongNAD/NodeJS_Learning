const express = require("express");
const {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
} = require("../controllers/position.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { ROLES } = require("../constant");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getPositions)
  .post(authorize(ROLES.ADMIN, ROLES.HR), createPosition);

router
  .route("/:id")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getPositionById)
  .put(authorize(ROLES.ADMIN, ROLES.HR), updatePosition)
  .delete(authorize(ROLES.ADMIN), deletePosition);

module.exports = router;
