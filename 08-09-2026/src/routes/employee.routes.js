const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employee.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { ROLES } = require("../constant");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getEmployees)
  .post(authorize(ROLES.ADMIN, ROLES.HR), createEmployee);

router
  .route("/:id")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getEmployeeById)
  .put(authorize(ROLES.ADMIN, ROLES.HR), updateEmployee)
  .delete(authorize(ROLES.ADMIN), deleteEmployee);

module.exports = router;
