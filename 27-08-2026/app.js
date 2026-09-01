const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const { connectDB } = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const port = process.env.PORT || 3000;

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

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Library API is running" });
});

app.use("/books", bookRoutes);

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
