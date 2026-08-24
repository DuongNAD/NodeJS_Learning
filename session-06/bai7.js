const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Bài tập nhỏ 7</title>
    </head>
    <body>
      <h2>Form tìm kiếm (GET)</h2>
      <form action="/search" method="GET">
        <input type="text" name="keyword" placeholder="Nhập từ khóa...">
        <button type="submit">Tìm kiếm</button>
      </form>

      <hr>

      <h2>Form đăng ký (POST)</h2>
      <form action="/register" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <br><br>
        <input type="email" name="email" placeholder="Email" required>
        <br><br>
        <input type="password" name="password" placeholder="Password" required>
        <br><br>
        <button type="submit">Đăng ký</button>
      </form>
    </body>
    </html>
  `);
});

app.get("/search", (req, res) => {
  const keyword = req.query.keyword || "";
  res.send(`Kết quả tìm kiếm cho: ${keyword}`);
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  res.json({
    message: "Đăng ký thành công",
    user: { username, email, password }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
