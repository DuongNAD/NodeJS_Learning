require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("./src/app");
const { ROLES, STATUS } = require("./src/constant");
const generateToken = require("./src/utils/generateToken");
const { protect } = require("./src/middlewares/auth.middleware");
const { authorize } = require("./src/middlewares/role.middleware");
const { errorHandler, notFound } = require("./src/middlewares/error.middleware");

async function runTests() {
  console.log("Bat dau kiem thu he thong HR Management API (Bai 1)...");
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

  await assert("Kiem tra generateToken tao token hop le", async () => {
    const payload = { id: "123", email: "test@example.com", role: ROLES.STAFF, status: STATUS.ACTIVE };
    const token = generateToken(payload);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    if (decoded.id !== "123" || decoded.role !== ROLES.STAFF) {
      throw new Error("Payload giai ma khong khop");
    }
  });

  await assert("Kiem tra auth.middleware chan khi thieu token (401)", async () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };
    let nextCalled = false;
    protect(req, res, () => {
      nextCalled = true;
    });

    if (statusSent !== 401 || nextCalled) {
      throw new Error(`Expected 401 but got status ${statusSent}, nextCalled: ${nextCalled}`);
    }
  });

  await assert("Kiem tra auth.middleware gan req.user khi token hop le", async () => {
    const payload = { id: "user_01", role: ROLES.ADMIN };
    const token = generateToken(payload);
    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextCalled = false;
    const res = {};
    protect(req, res, () => {
      nextCalled = true;
    });

    if (!nextCalled || !req.user || req.user.id !== "user_01" || req.user.role !== ROLES.ADMIN) {
      throw new Error("Khong gan duoc req.user tu token");
    }
  });

  await assert("Kiem tra role.middleware cho phep dung role", async () => {
    const req = { user: { role: ROLES.ADMIN } };
    const res = {};
    let nextCalled = false;
    const middleware = authorize(ROLES.ADMIN, ROLES.HR);
    middleware(req, res, () => {
      nextCalled = true;
    });

    if (!nextCalled) {
      throw new Error("Bi chan mac du role hop le");
    }
  });

  await assert("Kiem tra role.middleware chan sai role (403)", async () => {
    const req = { user: { role: ROLES.STAFF } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };
    let nextCalled = false;
    const middleware = authorize(ROLES.ADMIN, ROLES.HR);
    middleware(req, res, () => {
      nextCalled = true;
    });

    if (statusSent !== 403 || nextCalled || jsonSent.message !== "Bạn không có quyền thực hiện chức năng này") {
      throw new Error(`Expected 403 and message, got ${statusSent}`);
    }
  });

  await assert("Kiem tra error.middleware format loi ValidationError (400)", async () => {
    const mockErr = {
      name: "ValidationError",
      errors: {
        email: { message: "Email không đúng định dạng" },
        password: { message: "Mật khẩu tối thiểu 6 ký tự" }
      }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      statusCode: 200,
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };

    errorHandler(mockErr, {}, res, () => {});

    if (statusSent !== 400 || jsonSent.message !== "Dữ liệu không hợp lệ" || jsonSent.errors.length !== 2) {
      throw new Error("Format loi ValidationError khong dung");
    }
  });

  await assert("Kiem tra error.middleware format loi Duplicate Key 11000 (400)", async () => {
    const mockErr = {
      code: 11000,
      keyValue: { code: "TECH" }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      statusCode: 200,
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };

    errorHandler(mockErr, {}, res, () => {});

    if (statusSent !== 400 || !jsonSent.errors[0].includes("code")) {
      throw new Error("Format loi duplicate key khong dung");
    }
  });

  await assert("Kiem tra notFound middleware tra ve 404", async () => {
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          }
        };
      }
    };

    notFound({}, res, () => {});

    if (statusSent !== 404 || jsonSent.message !== "Không tìm thấy dữ liệu") {
      throw new Error("Format loi notFound khong dung");
    }
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  await assert("Kiem tra GET / -> Server root endpoint hoat dong", async () => {
    const res = await fetch(`${baseUrl}/`);
    const data = await res.json();
    if (res.status !== 200 || !data.message.includes("HR Management API")) {
      throw new Error(`Root endpoint failed: ${JSON.stringify(data)}`);
    }
  });

  await assert("Kiem tra GET /api/departments khong kem token -> Tra ve 401", async () => {
    const res = await fetch(`${baseUrl}/api/departments`);
    const data = await res.json();
    if (res.status !== 401 || data.message !== "Vui lòng đăng nhập để tiếp tục") {
      throw new Error(`Expected 401, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  await assert("Kiem tra GET /api/positions khong kem token -> Tra ve 401", async () => {
    const res = await fetch(`${baseUrl}/api/positions`);
    const data = await res.json();
    if (res.status !== 401 || data.message !== "Vui lòng đăng nhập để tiếp tục") {
      throw new Error(`Expected 401, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  const staffToken = generateToken({
    id: new mongoose.Types.ObjectId().toString(),
    fullName: "Staff User",
    email: "staff@example.com",
    role: ROLES.STAFF,
    status: STATUS.ACTIVE
  });

  await assert("Kiem tra POST /api/departments voi role staff -> Tra ve 403 khong co quyen", async () => {
    const res = await fetch(`${baseUrl}/api/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ name: "Phong IT", code: "IT_TEST" })
    });
    const data = await res.json();
    if (res.status !== 403 || data.message !== "Bạn không có quyền thực hiện chức năng này") {
      throw new Error(`Expected 403, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  await assert("Kiem tra DELETE /api/departments/:id voi role hr -> Tra ve 403 chi admin duoc xoa", async () => {
    const hrToken = generateToken({
      id: new mongoose.Types.ObjectId().toString(),
      fullName: "HR User",
      email: "hr@example.com",
      role: ROLES.HR,
      status: STATUS.ACTIVE
    });

    const res = await fetch(`${baseUrl}/api/departments/60d0fe4f5311236168a109ca`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${hrToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403 || data.message !== "Bạn không có quyền thực hiện chức năng này") {
      throw new Error(`Expected 403, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  server.close();

  console.log(`\nKet qua kiem thu: ${passed} PASSED, ${failed} FAILED\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Loi khi thuc thi kiem thu:", err);
  process.exit(1);
});
