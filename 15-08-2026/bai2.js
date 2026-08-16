const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/search") {
    const keyword = parsedUrl.query.q;
    if (keyword && keyword.trim() !== "") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Search keyword: ${keyword}`);
    } else {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Missing search keyword");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server Bài 2 đang chạy tại http://localhost:${PORT}`);
});
