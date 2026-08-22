const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello Express.js");
});

app.get("/products", (req, res) => {
  res.send(`
    <h1>Product List</h1>
    <ul>
      <li>Laptop</li>
      <li>Phone</li>
      <li>Headphones</li>
    </ul>
  `);
});

app.get("/products/featured", (req, res) => {
  res.send(`
    <h1>Featured Product</h1>
    <p>Special deal on MacBook Pro!</p>
  `);
});

app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop Dell", price: 15000000 },
    { id: 2, name: "iPhone 15", price: 20000000 },
    { id: 3, name: "Sony Headphones", price: 3000000 }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
