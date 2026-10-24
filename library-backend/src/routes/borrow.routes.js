const express = require('express');
const {
  borrowBook,
  getAllBorrows,
  getMyBorrows,
  getOverdueBorrows,
  getBorrowById,
  returnBook,
} = require('../controllers/borrow.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/', protect, borrowBook);
router.get('/', protect, authorize('admin', 'librarian'), getAllBorrows);
router.get('/me', protect, getMyBorrows);
router.get('/overdue', protect, authorize('admin', 'librarian'), getOverdueBorrows);
router.get('/:id', protect, getBorrowById);
router.patch('/:id/return', protect, authorize('admin', 'librarian'), returnBook);

module.exports = router;
