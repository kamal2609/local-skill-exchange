const express = require('express');
const router = express.Router();

const {
  getBalanceSummary,
  getLedgerHistory,
  adminAdjustCredits,
} = require('../controllers/creditController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adminAdjustSchema } = require('../validators/creditValidators');

// User balance & ledger routes
router.get('/balance', protect, getBalanceSummary);
router.get('/ledger', protect, getLedgerHistory);

// Admin-only adjustment route
router.post('/admin-adjust', protect, authorize('ADMIN'), validate(adminAdjustSchema), adminAdjustCredits);

module.exports = router;

