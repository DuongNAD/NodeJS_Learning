const http = require("http");
const url = require("url");

let users = [
  { id: 1, name: "Nguyen Van A", age: 20 },
  { id: 2, name: "Tran Van B", age: 22 }
];

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error("Invalid JSON format"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method;

  if (method === "GET" && pathname === "/users") {
    sendJson(res, 200, users);
    return;
  }

  const getUserMatch = pathname.match(/^\/users\/(\d+)$/);
  if (method === "GET" && getUserMatch) {
    const id = parseInt(getUserMatch[1], 10);
    const user = users.find((u) => u.id === id);
    if (user) {
      sendJson(res, 200, user);
    } else {
      sendJson(res, 404, { message: `Không tìm thấy user có ID = ${id}` });
    }
    return;
  }

  if (method === "POST" && pathname === "/users") {
    try {
      const body = await getRequestBody(req);
      if (!body.name || body.age === undefined) {
        sendJson(res, 400, { message: "Vui lòng nhập đầy đủ 'name' và 'age'" });
        return;
      }
      const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        name: body.name,
        age: Number(body.age)
      };
      users.push(newUser);
      sendJson(res, 201, { message: "Thêm user thành công", user: newUser });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
    return;
  }

  const putUserMatch = pathname.match(/^\/users\/(\d+)$/);
  if (method === "PUT" && putUserMatch) {
    const id = parseInt(putUserMatch[1], 10);
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      sendJson(res, 404, { message: `Không tìm thấy user có ID = ${id}` });
      return;
    }
    try {
      const body = await getRequestBody(req);
      users[userIndex] = {
        ...users[userIndex],
        ...(body.name !== undefined && { name: body.name }),
        ...(body.age !== undefined && { age: Number(body.age) })
      };
      sendJson(res, 200, { message: "Cập nhật user thành công", user: users[userIndex] });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
    return;
  }

  const deleteUserMatch = pathname.match(/^\/users\/(\d+)$/);
  if (method === "DELETE" && deleteUserMatch) {
    const id = parseInt(deleteUserMatch[1], 10);
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      sendJson(res, 404, { message: `Không tìm thấy user có ID = ${id}` });
      return;
    }
    const [deletedUser] = users.splice(userIndex, 1);
    sendJson(res, 200, { message: `Đã xóa user ID = ${id}`, user: deletedUser });
    return;
  }

  sendJson(res, 404, { message: "Route không tồn tại (404 Not Found)" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server Quản lý User (Bài 3) đang chạy tại http://localhost:${PORT}`);
});
