const express = require("express");
const app = express();

app.use(express.json());

let books = [
  { id: 1, title: "Node.js Basics" }
];

app.get("/books", (req, res) => {
  res.json(books);
});

app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(item => item.id === id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  res.json(book);
});

app.post("/books", (req, res) => {
  if (!req.body.title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const book = {
    id: Date.now(),
    title: req.body.title
  };

  books.push(book);
  res.status(201).json(book);
});

app.put("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(item => item.id === id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  book.title = req.body.title || book.title;
  res.json(book);
});

app.delete("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex(item => item.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  const deletedBook = books.splice(index, 1)[0];
  res.json(deletedBook);
});

app.listen(3000, () => {
  console.log("API is running at http://localhost:3000");
});
