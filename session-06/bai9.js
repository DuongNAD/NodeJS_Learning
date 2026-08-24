const express = require("express");
const app = express();
const PORT = 3000;

// Middleware kiểm tra query token
function checkToken(req, res, next) {
  if (req.query.token === "123") {
    return next();
  }

  res.status(403).send("Forbidden");
}

// Route trang chủ
app.get("/", (req, res) => {
  res.send(`
    <h2>Bài tập nhỏ 9: Middleware kiểm tra Query Token</h2>
    <ul>
      <li><a href="/admin">Truy cập /admin không có token (403 Forbidden)</a></li>
      <li><a href="/admin?token=abc">Truy cập /admin với sai token (403 Forbidden)</a></li>
      <li><a href="/admin?token=123">Truy cập /admin với token=123 (Welcome admin)</a></li>
    </ul>
  `);
});

// Route /admin được bảo vệ bởi middleware checkToken
app.get("/admin", checkToken, (req, res) => {
  res.send("Welcome admin");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
