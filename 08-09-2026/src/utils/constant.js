const ROLES = {
  ADMIN: "admin",
  HR: "hr",
  STAFF: "staff"
};

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive"
};

module.exports = {
  ROLES,
  ROLE_LIST: Object.values(ROLES),
  STATUS,
  STATUS_LIST: Object.values(STATUS)
};
