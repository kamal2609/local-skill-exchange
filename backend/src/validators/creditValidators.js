const { z } = require('zod');

const adminAdjustSchema = z.object({
  targetUserId: z
    .string({ required_error: 'Target user ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid target user ID format'),
  amount: z
    .number({ required_error: 'Adjustment amount is required' })
    .refine((val) => val !== 0, 'Amount cannot be zero'),
  description: z
    .string({ required_error: 'Adjustment reason is required' })
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

module.exports = {
  adminAdjustSchema,
};

