const ROLES = {
  ADMIN: "admin",
  HR: "hr",
  STAFF: "staff"
};

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive"
};

const EMPLOYEE_STATUS = {
  PROBATION: "probation",
  ACTIVE: "active",
  INACTIVE: "inactive",
  RESIGNED: "resigned"
};

const GENDERS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other"
};

const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  LEAVE: "leave"
};

const LEAVE_TYPES = {
  ANNUAL: "annual",
  SICK: "sick",
  UNPAID: "unpaid"
};

const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

module.exports = {
  ROLES,
  ROLE_LIST: Object.values(ROLES),
  STATUS,
  STATUS_LIST: Object.values(STATUS),
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_LIST: Object.values(EMPLOYEE_STATUS),
  GENDERS,
  GENDER_LIST: Object.values(GENDERS),
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LIST: Object.values(ATTENDANCE_STATUS),
  LEAVE_TYPES,
  LEAVE_TYPE_LIST: Object.values(LEAVE_TYPES),
  LEAVE_STATUS,
  LEAVE_STATUS_LIST: Object.values(LEAVE_STATUS)
};
