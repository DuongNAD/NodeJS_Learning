const mongoose = require("mongoose");
const Book = require("../models/Book");

function validateObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid book id");
  }
}

async function addBook(data, currentUser) {
  const book = await Book.create({
    title: data.title,
    author: data.author,
    category: data.category,
    available: data.available,
    createdBy: currentUser.userId,
  });

  return book;
}

async function listBooks(query = {}) {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  return Book.find(filter).populate("createdBy", "name email");
}

async function findBook(id) {
  validateObjectId(id);

  const book = await Book.findById(id).populate("createdBy", "name email");
  if (!book) {
    throw new Error("Book not found");
  }

  return book;
}

async function editBook(id, data) {
  validateObjectId(id);

  const book = await Book.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!book) {
    throw new Error("Book not found");
  }

  return book;
}

async function removeBook(id) {
  validateObjectId(id);

  const book = await Book.findByIdAndDelete(id);
  if (!book) {
    throw new Error("Book not found");
  }

  return { message: "Book deleted" };
}

module.exports = {
  addBook,
  listBooks,
  findBook,
  editBook,
  removeBook,
};
