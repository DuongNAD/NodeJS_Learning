const express = require("express");
const app = express();

app.use(express.json());

let products = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    price: 1500,
    category: "Laptop",
    stock: 10
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 1200,
    category: "Phone",
    stock: 25
  },
  {
    id: 3,
    name: "Logitech MX Master 3",
    price: 100,
    category: "Accessory",
    stock: 50
  }
];

function validateProduct(data) {
  const { name, price, category, stock } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    return "Name là bắt buộc và phải là chuỗi không rỗng";
  }

  const numPrice = Number(price);
  if (price === undefined || price === null || isNaN(numPrice) || numPrice <= 0) {
    return "Price là bắt buộc và phải là số lớn hơn 0";
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return "Category là bắt buộc và phải là chuỗi không rỗng";
  }

  const numStock = Number(stock);
  if (
    stock === undefined ||
    stock === null ||
    isNaN(numStock) ||
    !Number.isInteger(numStock) ||
    numStock < 0
  ) {
    return "Stock là bắt buộc và phải là số nguyên không âm (>= 0)";
  }

  return null;
}

app.get("/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

app.post("/products", (req, res) => {
  const errorMessage = validateProduct(req.body);
  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  const { name, price, category, stock } = req.body;
  const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: nextId,
    name: name.trim(),
    price: Number(price),
    category: category.trim(),
    stock: Number(stock)
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, price, category, stock } = req.body;

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name phải là chuỗi không rỗng" });
    }
    product.name = name.trim();
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: "Price phải là số lớn hơn 0" });
    }
    product.price = numPrice;
  }

  if (category !== undefined) {
    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ message: "Category phải là chuỗi không rỗng" });
    }
    product.category = category.trim();
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0) {
      return res.status(400).json({ message: "Stock phải là số nguyên không âm (>= 0)" });
    }
    product.stock = numStock;
  }

  res.status(200).json(product);
});

app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deletedProduct = products.splice(index, 1)[0];
  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Product API is running at http://localhost:${PORT}`);
});
