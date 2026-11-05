const express = require('express');
const router = express.Router();

const {
  createSession,
  getSessions,
  getSessionById,
  updateSessionStatus,
  confirmSession,
} = require('../controllers/sessionController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createSessionSchema,
  updateSessionStatusSchema,
} = require('../validators/sessionValidators');

// All session routes are private
router.get('/', protect, getSessions);
router.post('/', protect, validate(createSessionSchema), createSession);
router.get('/:id', protect, getSessionById);
router.put('/:id/status', protect, validate(updateSessionStatusSchema), updateSessionStatus);
router.post('/:id/confirm', protect, confirmSession);

module.exports = router;

