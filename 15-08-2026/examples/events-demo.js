const http = require("http");
const EventEmitter = require("events");

const appEvents = new EventEmitter();

appEvents.on("user-login", (username) => {
  console.log(`[EVENT] Người dùng "${username}" đã đăng nhập vào hệ thống.`);
});

appEvents.on("request-received", (method, url) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOG ${timestamp}] ${method} ${url}`);
});

console.log("--- Minh họa Event cơ bản ---");
appEvents.emit("user-login", "admin");
appEvents.emit("user-login", "duongnad");

const server = http.createServer((req, res) => {
  appEvents.emit("request-received", req.method, req.url);

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Server Event Demo OK");
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\nHTTP Server với EventEmitter đang chạy tại http://localhost:${PORT}`);
});
