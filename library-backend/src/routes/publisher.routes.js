const express = require('express');
const {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
} = require('../controllers/publisher.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', getPublishers);
router.get('/:id', getPublisherById);
router.post('/', protect, authorize('admin', 'librarian'), createPublisher);
router.put('/:id', protect, authorize('admin', 'librarian'), updatePublisher);
router.delete('/:id', protect, authorize('admin'), deletePublisher);

module.exports = router;
