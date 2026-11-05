const express = require('express');
const router = express.Router();

const {
  getMyAvailability,
  updateMyAvailability,
  getUserAvailability,
  createSlot,
  deleteSlot,
} = require('../controllers/availabilityController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { singleSlotSchema, bulkAvailabilitySchema } = require('../validators/availabilityValidators');

// Current user's weekly schedule
router.get('/my', protect, getMyAvailability);
router.put('/my', protect, validate(bulkAvailabilitySchema), updateMyAvailability);

// Public schedule of a target user (for booking calendar)
router.get('/user/:userId', getUserAvailability);

// Granular slot routes
router.post('/', protect, validate(singleSlotSchema), createSlot);
router.delete('/:id', protect, deleteSlot);

module.exports = router;

