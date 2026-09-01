const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

function booksCollection() {
  return getDB().collection("books");
}

function isValidId(id) {
  return ObjectId.isValid(id);
}

router.post("/", async (req, res) => {
  try {
    const { title, author, category, available } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    if (available !== undefined && typeof available !== "boolean") {
      return res.status(400).json({ message: "Available must be a boolean" });
    }

    const book = {
      title,
      author,
      category: category || "General",
      available: available !== undefined ? available : true,
    };

    const result = await booksCollection().insertOne(book);
    res.status(201).json({ _id: result.insertedId, ...book });
  } catch (error) {
    res.status(500).json({ message: "Cannot create book" });
  }
});

router.get("/", async (req, res) => {
  try {
    const books = await booksCollection().find().toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Cannot get books" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const books = await booksCollection()
      .find({ category: { $regex: new RegExp(`^${category}$`, "i") } })
      .toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Cannot get books by category" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await booksCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Cannot get book" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const allowedFields = ["title", "author", "category", "available"];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (
      updateData.available !== undefined &&
      typeof updateData.available !== "boolean"
    ) {
      return res.status(400).json({ message: "Available must be a boolean" });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const result = await booksCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated" });
  } catch (error) {
    res.status(500).json({ message: "Cannot update book" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const result = await booksCollection().deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: "Cannot delete book" });
  }
});

module.exports = router;
