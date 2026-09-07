const express = require("express");
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBook);
router.post("/", authMiddleware, roleMiddleware("admin"), createBook);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateBook);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteBook);

module.exports = router;

