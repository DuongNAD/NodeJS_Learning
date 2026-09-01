const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

/**
 * Lấy tham chiếu đến collection 'books'
 */
function booksCollection() {
  return getDB().collection("books");
}

/**
 * Kiểm tra chuỗi id có hợp lệ chuẩn ObjectId 24 ký tự hex của MongoDB không
 * @param {string} id 
 * @returns {boolean}
 */
function isValidId(id) {
  return ObjectId.isValid(id);
}

// =========================================================================
// 5.1. Create: Thêm sách mới (POST /books)
// =========================================================================
router.post("/", async (req, res) => {
  try {
    const { title, author, category, available } = req.body;

    // Validate các trường bắt buộc
    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    // Validate kiểu dữ liệu của available (nếu được truyền lên)
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

// =========================================================================
// 5.2. Read All: Lấy danh sách toàn bộ sách (GET /books)
// =========================================================================
router.get("/", async (req, res) => {
  try {
    const books = await booksCollection().find().toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Cannot get books" });
  }
});

// =========================================================================
// BÀI TẬP 2: Tìm sách theo Category (GET /books/category/:category)
// =========================================================================
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    // Tìm kiếm chính xác không phân biệt hoa thường theo thể loại
    const books = await booksCollection()
      .find({ category: { $regex: new RegExp(`^${category}$`, "i") } })
      .toArray();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Cannot get books by category" });
  }
});

// =========================================================================
// 5.3. Read One: Lấy chi tiết 1 cuốn sách theo ID (GET /books/:id)
// =========================================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Kiểm tra tính hợp lệ của ObjectId
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    // 2. Truy vấn MongoDB với ObjectId
    const book = await booksCollection().findOne({
      _id: new ObjectId(id),
    });

    // 3. Xử lý trường hợp không tìm thấy sách
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Cannot get book" });
  }
});

// =========================================================================
// 5.4. Update: Cập nhật thông tin sách (PUT /books/:id)
// =========================================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    // Whitelist: Chỉ cho phép cập nhật các trường được định nghĩa
    const allowedFields = ["title", "author", "category", "available"];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validate kiểu dữ liệu của available nếu có cập nhật
    if (
      updateData.available !== undefined &&
      typeof updateData.available !== "boolean"
    ) {
      return res.status(400).json({ message: "Available must be a boolean" });
    }

    // Nếu không có trường hợp lệ nào được truyền lên
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Thực hiện update với $set an toàn
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

// =========================================================================
// 5.5. Delete: Xóa sách (DELETE /books/:id)
// =========================================================================
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
