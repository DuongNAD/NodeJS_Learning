require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("./src/app");
const { ROLES, STATUS } = require("./src/constant");
const generateToken = require("./src/utils/generateToken");
const { getPagination, formatPaginationResponse } = require("./src/utils/pagination");
const { protect } = require("./src/middlewares/auth.middleware");
const { authorize } = require("./src/middlewares/role.middleware");
const { errorHandler, notFound } = require("./src/middlewares/error.middleware");

async function runTests() {
  console.log("Bat dau kiem thu he thong HR Management API (Bai 1 & Bai 2: Nhan vien, Cham cong, Nghi phep)...");
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

  await assert("Kiem tra getPagination va formatPaginationResponse", async () => {
    const { page, limit, skip } = getPagination({ page: "2", limit: "5" });
    if (page !== 2 || limit !== 5 || skip !== 5) {
      throw new Error("Tinh toan getPagination khong dung");
    }
    const paginated = formatPaginationResponse(2, 5, 23);
    if (paginated.totalPages !== 5 || paginated.totalItems !== 23) {
      throw new Error("formatPaginationResponse khong dung");
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
      throw new Error(`Expected 401 but got status ${statusSent}`);
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
        salary: { message: "Lương phải lớn hơn hoặc bằng 0" }
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

  await assert("Kiem tra GET /api/employees khong token -> Tra ve 401", async () => {
    const res = await fetch(`${baseUrl}/api/employees`);
    const data = await res.json();
    if (res.status !== 401 || data.message !== "Vui lòng đăng nhập để tiếp tục") {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  const staffToken = generateToken({
    id: new mongoose.Types.ObjectId().toString(),
    fullName: "Staff User",
    email: "staff@example.com",
    role: ROLES.STAFF,
    status: STATUS.ACTIVE
  });

  const hrToken = generateToken({
    id: new mongoose.Types.ObjectId().toString(),
    fullName: "HR User",
    email: "hr@example.com",
    role: ROLES.HR,
    status: STATUS.ACTIVE
  });

  await assert("Kiem tra POST /api/employees voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ fullName: "Nguyen Van B" })
    });
    const data = await res.json();
    if (res.status !== 403 || data.message !== "Bạn không có quyền thực hiện chức năng này") {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra DELETE /api/employees/:id voi role hr -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/employees/60d0fe4f5311236168a109ca`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${hrToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403 || data.message !== "Bạn không có quyền thực hiện chức năng này") {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/attendances khong token -> Tra ve 401", async () => {
    const res = await fetch(`${baseUrl}/api/attendances`);
    const data = await res.json();
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/attendances voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/attendances`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/leaves khong token -> Tra ve 401", async () => {
    const res = await fetch(`${baseUrl}/api/leaves`);
    const data = await res.json();
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/leaves voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/leaves`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  const { exportCsv } = require("./src/utils/exportCsv");
  const User = require("./src/models/User");
  const Employee = require("./src/models/Employee");

  await assert("Kiem tra User schema co chua cac truong avatarUrl, phone, address", async () => {
    const userPaths = User.schema.paths;
    if (!userPaths.avatarUrl || !userPaths.phone || !userPaths.address) {
      throw new Error("User schema thieu truong avatarUrl, phone, hoac address");
    }
  });

  await assert("Kiem tra Employee schema co chua cac truong avatarUrl, note", async () => {
    const employeePaths = Employee.schema.paths;
    if (!employeePaths.avatarUrl || !employeePaths.note) {
      throw new Error("Employee schema thieu truong avatarUrl hoac note");
    }
  });

  await assert("Kiem tra utility exportCsv tao noi dung CSV dung format kem BOM", async () => {
    const mockData = [
      {
        employeeCode: "NV001",
        fullName: "Nguyen Van A",
        email: "a@example.com",
        phone: "0901234567",
        department: "Ky thuat",
        position: "Lap trinh vien",
        status: "active"
      }
    ];
    const csv = exportCsv(mockData);
    if (!csv.startsWith("\uFEFF")) {
      throw new Error("CSV khong bat dau bang BOM UTF-8");
    }
    if (!csv.includes("Mã nhân viên")) {
      throw new Error("CSV thieu header");
    }
    if (!csv.includes("NV001") || !csv.includes("Nguyen Van A")) {
      throw new Error("CSV thieu du lieu");
    }
  });

  await assert("Kiem tra GET /api/profile khong token -> Tra ve 401", async () => {
    const res = await fetch(`${baseUrl}/api/profile`);
    const data = await res.json();
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  await assert("Kiem tra PATCH /api/profile/change-password thieu du lieu -> Tra ve 400", async () => {
    const res = await fetch(`${baseUrl}/api/profile/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (res.status !== 400) {
      throw new Error(`Expected 400, got ${res.status}`);
    }
  });

  await assert("Kiem tra PATCH /api/profile/change-password mat khau moi < 6 ky tu -> Tra ve 400", async () => {
    const res = await fetch(`${baseUrl}/api/profile/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ oldPassword: "123", newPassword: "123" })
    });
    const data = await res.json();
    if (res.status !== 400 || !data.message.includes("tối thiểu 6 ký tự")) {
      throw new Error(`Expected 400 minlength error, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/statistics/overview voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/statistics/overview`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/statistics/departments voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/statistics/departments`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/statistics/positions voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/statistics/positions`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/employees/birthdays voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/employees/birthdays`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/employees/birthdays thang khong hop le -> Tra ve 400", async () => {
    const res = await fetch(`${baseUrl}/api/employees/birthdays?month=15`, {
      headers: {
        Authorization: `Bearer ${hrToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 400) {
      throw new Error(`Expected 400, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/employees/probation-ending voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/employees/probation-ending`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/employees/probation-ending so ngay am -> Tra ve 400", async () => {
    const res = await fetch(`${baseUrl}/api/employees/probation-ending?days=-5`, {
      headers: {
        Authorization: `Bearer ${hrToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 400) {
      throw new Error(`Expected 400, got ${res.status}`);
    }
  });

  await assert("Kiem tra GET /api/employees/export voi role staff -> Tra ve 403", async () => {
    const res = await fetch(`${baseUrl}/api/employees/export`, {
      headers: {
        Authorization: `Bearer ${staffToken}`
      }
    });
    const data = await res.json();
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
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
