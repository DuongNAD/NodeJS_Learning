const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let products = [
  { id: 1, name: "Laptop", price: 20000000 },
  { id: 2, name: "Bàn phím cơ", price: 1500000 },
  { id: 3, name: "Chuột không dây", price: 500000 }
];

app.get("/products", (req, res) => {
  res.status(200).json({
    success: true,
    total: products.length,
    data: products
  });
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  
  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "ID sản phẩm phải là một số hợp lệ"
    });
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sản phẩm có ID: ${id}`
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

app.post("/products", (req, res) => {
  const { name, price } = req.body;

  if (!name || price === undefined || price === null || isNaN(Number(price))) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp đầy đủ 'name' (chuỗi) và 'price' (số)"
    });
  }

  const numericPrice = Number(price);
  if (numericPrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Giá sản phẩm phải lớn hơn hoặc bằng 0"
    });
  }

  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = {
    id: newId,
    name: name.trim(),
    price: numericPrice
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    message: "Thêm sản phẩm thành công",
    data: newProduct
  });
});

app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "ID sản phẩm phải là một số hợp lệ"
    });
  }

  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sản phẩm có ID: ${id} để cập nhật`
    });
  }

  const { name, price } = req.body;

  if (!name && price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Cần truyền ít nhất trường 'name' hoặc 'price' để cập nhật"
    });
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm không được để trống"
      });
    }
    products[productIndex].name = name.trim();
  }

  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm phải là một số hợp lệ >= 0"
      });
    }
    products[productIndex].price = numericPrice;
  }

  res.status(200).json({
    success: true,
    message: "Cập nhật sản phẩm thành công",
    data: products[productIndex]
  });
});

app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "ID sản phẩm phải là một số hợp lệ"
    });
  }

  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy sản phẩm có ID: ${id} để xoá`
    });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.status(200).json({
    success: true,
    message: "Xoá sản phẩm thành công",
    data: deletedProduct
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại"
  });
});

app.listen(PORT, () => {
  console.log(`Server Quản lý sản phẩm đang chạy tại: http://localhost:${PORT}`);
});
