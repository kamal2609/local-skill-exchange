const express = require('express');
const router = express.Router();

const {
  getRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRequestSchema, updateRequestSchema } = require('../validators/requestValidators');

// Public directory and detail
router.get('/', getRequests);
router.get('/my', protect, getMyRequests);
router.get('/:id', getRequestById);

// Protected CRUD
router.post('/', protect, validate(createRequestSchema), createRequest);
router.put('/:id', protect, validate(updateRequestSchema), updateRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;

