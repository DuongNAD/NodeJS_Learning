const express = require('express');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getLowStockBooks,
  exportBooks,
} = require('../controllers/book.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', getBooks);
router.get('/low-stock', protect, authorize('admin', 'librarian'), getLowStockBooks);
router.get('/export', protect, authorize('admin', 'librarian'), exportBooks);
router.get('/:id', getBookById);
router.post('/', protect, authorize('admin', 'librarian'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
