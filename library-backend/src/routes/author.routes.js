const express = require('express');
const {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/author.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', getAuthors);
router.get('/:id', getAuthorById);
router.post('/', protect, authorize('admin', 'librarian'), createAuthor);
router.put('/:id', protect, authorize('admin', 'librarian'), updateAuthor);
router.delete('/:id', protect, authorize('admin'), deleteAuthor);

module.exports = router;
