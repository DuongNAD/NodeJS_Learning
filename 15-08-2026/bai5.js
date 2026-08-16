const http = require("http");
const url = require("url");

let todos = [
  { id: 1, title: "Học Node.js", completed: false },
  { id: 2, title: "Làm bài tập", completed: true }
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

  if (method === "GET" && pathname === "/todos") {
    sendJson(res, 200, todos);
    return;
  }

  const getTodoMatch = pathname.match(/^\/todos\/(\d+)$/);
  if (method === "GET" && getTodoMatch) {
    const id = parseInt(getTodoMatch[1], 10);
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      sendJson(res, 200, todo);
    } else {
      sendJson(res, 404, { message: `Không tìm thấy todo có ID = ${id}` });
    }
    return;
  }

  if (method === "POST" && pathname === "/todos") {
    try {
      const body = await getRequestBody(req);
      if (!body.title) {
        sendJson(res, 400, { message: "Vui lòng nhập 'title' cho todo" });
        return;
      }
      const nextId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
      const newTodo = {
        id: nextId,
        title: body.title,
        completed: Boolean(body.completed ?? false)
      };
      todos.push(newTodo);
      sendJson(res, 201, { message: "Thêm todo thành công", todo: newTodo });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
    return;
  }

  const putTodoMatch = pathname.match(/^\/todos\/(\d+)$/);
  if (method === "PUT" && putTodoMatch) {
    const id = parseInt(putTodoMatch[1], 10);
    const todoIndex = todos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      sendJson(res, 404, { message: `Không tìm thấy todo có ID = ${id}` });
      return;
    }
    try {
      const body = await getRequestBody(req);
      todos[todoIndex] = {
        ...todos[todoIndex],
        ...(body.title !== undefined && { title: body.title }),
        ...(body.completed !== undefined && { completed: Boolean(body.completed) })
      };
      sendJson(res, 200, { message: "Cập nhật todo thành công", todo: todos[todoIndex] });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
    return;
  }

  const deleteTodoMatch = pathname.match(/^\/todos\/(\d+)$/);
  if (method === "DELETE" && deleteTodoMatch) {
    const id = parseInt(deleteTodoMatch[1], 10);
    const todoIndex = todos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      sendJson(res, 404, { message: `Không tìm thấy todo có ID = ${id}` });
      return;
    }
    const [deletedTodo] = todos.splice(todoIndex, 1);
    sendJson(res, 200, { message: `Đã xóa todo ID = ${id}`, todo: deletedTodo });
    return;
  }

  sendJson(res, 404, { message: "Route không tồn tại (404 Not Found)" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server Quản lý Todo (Bài 5) đang chạy tại http://localhost:${PORT}`);
});
