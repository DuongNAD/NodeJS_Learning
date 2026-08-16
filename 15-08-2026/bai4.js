const http = require("http");
const url = require("url");

let products = [
  { id: 1, name: "Laptop", price: 20000000 },
  { id: 2, name: "Mouse", price: 500000 }
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

  if (method === "GET" && pathname === "/products") {
    sendJson(res, 200, products);
    return;
  }

  const getProductMatch = pathname.match(/^\/products\/(\d+)$/);
  if (method === "GET" && getProductMatch) {
    const id = parseInt(getProductMatch[1], 10);
    const product = products.find((p) => p.id === id);
    if (product) {
      sendJson(res, 200, product);
    } else {
      sendJson(res, 404, { message: `Không tìm thấy product có ID = ${id}` });
    }
    return;
  }

  if (method === "POST" && pathname === "/products") {
    try {
      const body = await getRequestBody(req);
      if (!body.name || body.price === undefined) {
        sendJson(res, 400, { message: "Vui lòng nhập đầy đủ 'name' và 'price'" });
        return;
      }
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct = {
        id: nextId,
        name: body.name,
        price: Number(body.price)
      };
      products.push(newProduct);
      sendJson(res, 201, { message: "Thêm product thành công", product: newProduct });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
    return;
  }

  const putProductMatch = pathname.match(/^\/products\/(\d+)$/);
  if (method === "PUT" && putProductMatch) {
    const id = parseInt(putProductMatch[1], 10);
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      sendJson(res, 404, { message: `Không tìm thấy product có ID = ${id}` });
      return;
    }
    try {
      const body = await getRequestBody(req);
      products[productIndex] = {
        ...products[productIndex],
        ...(body.name !== undefined && { name: body.name }),
        ...(body.price !== undefined && { price: Number(body.price) })
      };
      sendJson(res, 200, { message: "Cập nhật product thành công", product: products[productIndex] });
    } catch (err) {
      sendJson(res, 400, { message: err.message });
    }
    return;
  }

  const deleteProductMatch = pathname.match(/^\/products\/(\d+)$/);
  if (method === "DELETE" && deleteProductMatch) {
    const id = parseInt(deleteProductMatch[1], 10);
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      sendJson(res, 404, { message: `Không tìm thấy product có ID = ${id}` });
      return;
    }
    const [deletedProduct] = products.splice(productIndex, 1);
    sendJson(res, 200, { message: `Đã xóa product ID = ${id}`, product: deletedProduct });
    return;
  }

  sendJson(res, 404, { message: "Route không tồn tại (404 Not Found)" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server Quản lý Product (Bài 4) đang chạy tại http://localhost:${PORT}`);
});
