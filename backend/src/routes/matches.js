const express = require('express');
const router = express.Router();

const {
  getSmartMatches,
  getReciprocalMatches,
  getPartnerMatchDetail,
} = require('../controllers/matchController');

const { protect } = require('../middleware/auth');

// All match routes are private and require authentication
router.get('/', protect, getSmartMatches);
router.get('/reciprocal', protect, getReciprocalMatches);
router.get('/:partnerId', protect, getPartnerMatchDetail);

module.exports = router;

