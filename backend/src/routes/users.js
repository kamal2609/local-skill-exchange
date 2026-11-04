const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidators');

// Protected profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

// Public directory & member profile routes
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
