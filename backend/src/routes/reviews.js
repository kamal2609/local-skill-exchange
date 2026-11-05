const express = require('express');
const router = express.Router();

const {
  createReview,
  getUserReviews,
} = require('../controllers/reviewController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewSchema } = require('../validators/communityValidators');

router.post('/', protect, validate(createReviewSchema), createReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;

