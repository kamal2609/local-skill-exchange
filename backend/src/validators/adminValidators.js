const { z } = require('zod');

const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status is required' }),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['LEARNER', 'PROVIDER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be LEARNER, PROVIDER, or ADMIN' }),
  }),
});

const resolveReportSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'], {
    errorMap: () => ({ message: 'Status must be PENDING, REVIEWED, RESOLVED, or DISMISSED' }),
  }),
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50, 'Max 50 characters'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  icon: z.string().optional(),
});

module.exports = {
  updateUserStatusSchema,
  updateUserRoleSchema,
  resolveReportSchema,
  createCategorySchema,
};
