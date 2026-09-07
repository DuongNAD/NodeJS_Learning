const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Library Backend API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
