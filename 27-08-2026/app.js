const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const { connectDB } = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware CORS cho phép ReactJS Frontend (ví dụ http://localhost:5173) gọi API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware phân tích JSON request body
app.use(express.json());

// Endpoint kiểm tra sức khỏe server (Root endpoint)
app.get("/", (req, res) => {
  res.json({ message: "Library API is running" });
});

// Gắn toàn bộ routes quản lý sách dưới tiền tố /books
app.use("/books", bookRoutes);

// Khởi động server (chỉ lắng nghe cổng sau khi kết nối MongoDB thành công)
async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Cannot start server:", error.message);
    process.exit(1);
  }
}

startServer();
