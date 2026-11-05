const express = require('express');
const router = express.Router();

const {
  getAdminMetrics,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  getAdminReports,
  resolveReport,
  createSkillCategory,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  updateUserStatusSchema,
  updateUserRoleSchema,
  resolveReportSchema,
  createCategorySchema,
} = require('../validators/adminValidators');

// Restrict all routes under /api/admin to authenticated administrators
router.use(protect);
router.use(authorize('ADMIN'));

// Platform metrics
router.get('/metrics', getAdminMetrics);

// User management
router.get('/users', getAdminUsers);
router.put('/users/:id/status', validate(updateUserStatusSchema), updateUserStatus);
router.put('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);

// Safety and moderation reports
router.get('/reports', getAdminReports);
router.put('/reports/:id', validate(resolveReportSchema), resolveReport);

// Skill category taxonomy
router.post('/categories', validate(createCategorySchema), createSkillCategory);

module.exports = router;

