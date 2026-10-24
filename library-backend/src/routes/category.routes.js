const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, authorize('admin', 'librarian'), createCategory);
router.put('/:id', protect, authorize('admin', 'librarian'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
