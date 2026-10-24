const express = require('express');
const {
  getOverview,
  getCategoryStatistics,
} = require('../controllers/statistic.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/overview', protect, authorize('admin', 'librarian'), getOverview);
router.get('/categories', protect, authorize('admin', 'librarian'), getCategoryStatistics);

module.exports = router;
