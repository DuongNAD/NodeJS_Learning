const http = require("http");
const url = require("url");
const querystring = require("querystring");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  if (parsedUrl.pathname === "/search") {
    const query = querystring.parse(
      parsedUrl.query
    );

    const keyword = query.keyword || "";
    const page = query.page || "1";

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    res.end(`
      <h1>Search</h1>
      <p>Keyword: ${keyword}</p>
      <p>Page: ${page}</p>
    `);

    return;
  }

  res.writeHead(404, {
    "Content-Type": "text/html; charset=utf-8"
  });
  res.end("<h1>404 - Trang không tồn tại</h1>");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
