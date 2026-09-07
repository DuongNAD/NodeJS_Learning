const bookService = require("../services/bookService");

async function createBook(req, res) {
  try {
    const book = await bookService.addBook(req.body, req.user);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getBooks(req, res) {
  try {
    const books = await bookService.listBooks(req.query);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getBook(req, res) {
  try {
    const book = await bookService.findBook(req.params.id);
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

async function updateBook(req, res) {
  try {
    const book = await bookService.editBook(req.params.id, req.body);
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteBook(req, res) {
  try {
    const result = await bookService.removeBook(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
};
