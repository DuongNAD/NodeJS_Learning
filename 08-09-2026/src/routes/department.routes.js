const express = require("express");
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/department.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { ROLES } = require("../constant");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getDepartments)
  .post(authorize(ROLES.ADMIN, ROLES.HR), createDepartment);

router
  .route("/:id")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getDepartmentById)
  .put(authorize(ROLES.ADMIN, ROLES.HR), updateDepartment)
  .delete(authorize(ROLES.ADMIN), deleteDepartment);

module.exports = router;
