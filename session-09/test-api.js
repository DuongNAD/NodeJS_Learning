require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { verifyToken } = require("./src/utils/jwt");

async function runTests() {
  console.log("=== BAT DAU KIEM THU TOAN DIEN API (library-backend) ===\n");

  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`Server test dang chay tai: ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`[PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${desc} -> Loi: ${err.message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const normalUserEmail = `user_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;

  let userToken = null;
  let adminToken = null;
  let createdBookId = null;

  await assert("1. GET / -> Kiem tra server hoat dong", async () => {
    const res = await fetch(`${baseUrl}/`);
    const data = await res.json();
    if (!data.success || !data.message.includes("Library Backend API")) {
      throw new Error(`Response khong hop le: ${JSON.stringify(data)}`);
    }
  });

  await assert("2. POST /api/auth/register -> Dang ky user mac dinh role 'user'", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Normal User",
        email: normalUserEmail,
        password: "password123",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success || data.data.email !== normalUserEmail) {
      throw new Error(`Dang ky that bai: ${JSON.stringify(data)}`);
    }
    if (data.data.role !== "user") {
      throw new Error(`Role mac dinh phai la 'user', nhan duoc: ${data.data.role}`);
    }
    if (data.data.password) {
      throw new Error("Bao mat: password khong duoc tra ve client");
    }
  });

  await assert("3. POST /api/auth/login -> Dang nhap user va kiem tra role trong JWT", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalUserEmail,
        password: "password123",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success || !data.data.token) {
      throw new Error(`Dang nhap that bai: ${JSON.stringify(data)}`);
    }
    userToken = data.data.token;
    const decoded = verifyToken(userToken);
    if (decoded.role !== "user") {
      throw new Error(`JWT payload phai co role 'user', nhan duoc: ${decoded.role}`);
    }
  });

  await assert("4. POST /api/auth/register -> Dang ky tai khoan admin", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin User",
        email: adminEmail,
        password: "password123",
        role: "admin",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success || data.data.role !== "admin") {
      throw new Error(`Dang ky admin that bai: ${JSON.stringify(data)}`);
    }
  });

  await assert("5. POST /api/auth/login -> Dang nhap admin va kiem tra role trong JWT", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: "password123",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success || !data.data.token) {
      throw new Error(`Dang nhap admin that bai: ${JSON.stringify(data)}`);
    }
    adminToken = data.data.token;
    const decoded = verifyToken(adminToken);
    if (decoded.role !== "admin") {
      throw new Error(`JWT payload phai co role 'admin', nhan duoc: ${decoded.role}`);
    }
  });

  await assert("6. GET /api/auth/me -> Chan khi khong co token (401 Unauthorized)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    if (res.status !== 401) {
      throw new Error(`Khong chan request thieu token, status: ${res.status}`);
    }
  });

  await assert("7. GET /api/auth/me -> Tra ve thong tin user khi co token hop le", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success || data.data.email !== normalUserEmail) {
      throw new Error(`Lay thong tin user that bai: ${JSON.stringify(data)}`);
    }
  });

  await assert("8. POST /api/books -> Chan user thuong tao sach (403 Forbidden)", async () => {
    const res = await fetch(`${baseUrl}/api/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
      }),
    });
    const data = await res.json();
    if (res.status !== 403 || data.success !== false) {
      throw new Error(`Phai tra ve 403 Forbidden, nhan duoc: ${res.status}`);
    }
  });

  await assert("9. POST /api/books -> Cho phep admin tao sach (201 Created)", async () => {
    const res = await fetch(`${baseUrl}/api/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success || !data.data._id) {
      throw new Error(`Tao sach that bai: ${JSON.stringify(data)}`);
    }
    createdBookId = data.data._id;
  });

  await assert("10. GET /api/books -> Lay danh sach sach (public)", async () => {
    const res = await fetch(`${baseUrl}/api/books`);
    const data = await res.json();
    if (res.status !== 200 || !data.success || !Array.isArray(data.data)) {
      throw new Error(`Lay danh sach sach that bai: ${JSON.stringify(data)}`);
    }
  });

  await assert("11. GET /api/books?category=Programming -> Loc sach theo category", async () => {
    const res = await fetch(`${baseUrl}/api/books?category=Programming`);
    const data = await res.json();
    if (res.status !== 200 || !data.success || !Array.isArray(data.data)) {
      throw new Error(`Loc sach that bai: ${JSON.stringify(data)}`);
    }
    const allMatch = data.data.every((b) => b.category === "Programming");
    if (!allMatch || data.data.length === 0) {
      throw new Error("Loc danh muc khong chinh xac hoac khong co ket qua");
    }
  });

  await assert("12. GET /api/books?category=UnknownCategory -> Tra ve mang rong [] neu khong co sach", async () => {
    const res = await fetch(`${baseUrl}/api/books?category=UnknownCategory_${timestamp}`);
    const data = await res.json();
    if (res.status !== 200 || !data.success || !Array.isArray(data.data) || data.data.length !== 0) {
      throw new Error(`Phai tra ve mang rong [], nhan duoc: ${JSON.stringify(data)}`);
    }
  });

  await assert("13. GET /api/books/:id -> Lay chi tiet sach theo id (public)", async () => {
    const res = await fetch(`${baseUrl}/api/books/${createdBookId}`);
    const data = await res.json();
    if (res.status !== 200 || !data.success || data.data._id !== createdBookId) {
      throw new Error(`Lay chi tiet sach that bai: ${JSON.stringify(data)}`);
    }
  });

  await assert("14. PUT /api/books/:id -> Chan user thuong cap nhat sach (403 Forbidden)", async () => {
    const res = await fetch(`${baseUrl}/api/books/${createdBookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: "Clean Code - User Attempt",
      }),
    });
    if (res.status !== 403) {
      throw new Error(`Phai tra ve 403 Forbidden, nhan duoc: ${res.status}`);
    }
  });

  await assert("15. PUT /api/books/:id -> Cho phep admin cap nhat sach (200 OK)", async () => {
    const res = await fetch(`${baseUrl}/api/books/${createdBookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Clean Code - Admin Updated",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success || data.data.title !== "Clean Code - Admin Updated") {
      throw new Error(`Cap nhat sach that bai: ${JSON.stringify(data)}`);
    }
  });

  await assert("16. DELETE /api/books/:id -> Chan user thuong xoa sach (403 Forbidden)", async () => {
    const res = await fetch(`${baseUrl}/api/books/${createdBookId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    if (res.status !== 403) {
      throw new Error(`Phai tra ve 403 Forbidden, nhan duoc: ${res.status}`);
    }
  });

  await assert("17. DELETE /api/books/:id -> Cho phep admin xoa sach (200 OK)", async () => {
    const res = await fetch(`${baseUrl}/api/books/${createdBookId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Xoa sach that bai: ${JSON.stringify(data)}`);
    }
  });

  await assert("18. GET /api/books/invalid_id -> Bat loi dinh dang id khong hop le", async () => {
    const res = await fetch(`${baseUrl}/api/books/invalid_id_12345`);
    const data = await res.json();
    if (data.success !== false) {
      throw new Error("Server khong bat loi id khong hop le");
    }
  });

  console.log(`\n=== TONG KET KIEM THU: ${passed} PASSED, ${failed} FAILED ===`);

  server.close();
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Loi khi chay kiem thu:", err);
  process.exit(1);
});
