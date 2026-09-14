const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getBirthdays,
  getProbationEnding,
  exportEmployees
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
  .route("/birthdays")
  .get(authorize(ROLES.ADMIN, ROLES.HR), getBirthdays);

router
  .route("/probation-ending")
  .get(authorize(ROLES.ADMIN, ROLES.HR), getProbationEnding);

router
  .route("/export")
  .get(authorize(ROLES.ADMIN, ROLES.HR), exportEmployees);

router
  .route("/:id")
  .get(authorize(ROLES.ADMIN, ROLES.HR, ROLES.STAFF), getEmployeeById)
  .put(authorize(ROLES.ADMIN, ROLES.HR), updateEmployee)
  .delete(authorize(ROLES.ADMIN), deleteEmployee);

module.exports = router;
