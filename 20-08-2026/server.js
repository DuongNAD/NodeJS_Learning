const http = require("http");

const {
  sendHtml,
  sendText
} = require("./htmlHelper");

const {
  logRequest
} = require("./logger");

const server = http.createServer(
  (req, res) => {
    logRequest(req);

    if (req.url === "/") {
      sendHtml(
        res,
        "<h1>Home</h1>"
      );

      return;
    }

    sendText(
      res,
      404,
      "404 Not Found"
    );
  }
);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
