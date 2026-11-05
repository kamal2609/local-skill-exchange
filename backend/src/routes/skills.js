const express = require('express');
const router = express.Router();

const {
  getSkills,
  getSkillById,
  createSkill,
} = require('../controllers/skillController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSkillSchema } = require('../validators/skillValidators');

// Public catalog routes
router.get('/', getSkills);
router.get('/:id', getSkillById);

// Protected skill creation
router.post('/', protect, validate(createSkillSchema), createSkill);

module.exports = router;
