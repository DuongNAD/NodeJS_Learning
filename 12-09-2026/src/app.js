const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const departmentRoutes = require("./routes/department.routes");
const positionRoutes = require("./routes/position.routes");
const employeeRoutes = require("./routes/employee.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const profileRoutes = require("./routes/profile.routes");
const statisticRoutes = require("./routes/statistic.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    message: "HR Management API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/statistics", statisticRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
