const express = require('express');
const router = express.Router();

const {
  getOffers,
  getMyOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOfferSchema, updateOfferSchema } = require('../validators/offerValidators');

// Public directory and detail
router.get('/', getOffers);
router.get('/my', protect, getMyOffers);
router.get('/:id', getOfferById);

// Protected CRUD
router.post('/', protect, validate(createOfferSchema), createOffer);
router.put('/:id', protect, validate(updateOfferSchema), updateOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;

