const http = require("http");
const { formidable } = require("formidable");

const server = http.createServer((req, res) => {
  if (
    req.url === "/upload" &&
    req.method === "GET"
  ) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    res.end(`
      <h1>Upload File</h1>

      <form
        action="/upload"
        method="post"
        enctype="multipart/form-data"
      >
        <input
          type="file"
          name="fileUpload"
        >

        <button type="submit">
          Upload
        </button>
      </form>
    `);

    return;
  }

  if (
    req.url === "/upload" &&
    req.method === "POST"
  ) {
    const form = formidable({
      multiples: false
    });

    form.parse(
      req,
      (err, fields, files) => {
        if (err) {
          res.writeHead(500, {
            "Content-Type":
              "text/plain; charset=utf-8"
          });

          res.end("Upload error");
          return;
        }

        res.writeHead(200, {
          "Content-Type":
            "application/json; charset=utf-8"
        });

        res.end(
          JSON.stringify({
            fields,
            files
          })
        );
      }
    );

    return;
  }

  res.writeHead(404, {
    "Content-Type": "text/plain"
  });

  res.end("404 Not Found");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/upload");
});
