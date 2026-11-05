const express = require('express');
const router = express.Router();

const {
  createReport,
  getReports,
  updateReportStatus,
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReportSchema } = require('../validators/communityValidators');

router.post('/', protect, validate(createReportSchema), createReport);
router.get('/', protect, authorize('ADMIN'), getReports);
router.put('/:id', protect, authorize('ADMIN'), updateReportStatus);

module.exports = router;

