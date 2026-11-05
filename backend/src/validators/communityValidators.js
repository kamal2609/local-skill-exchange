const { z } = require('zod');

const createReviewSchema = z.object({
  sessionId: z
    .string({ required_error: 'Session ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Session ID format'),
  reviewedUserId: z
    .string({ required_error: 'Reviewed user ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format'),
  rating: z
    .number({ required_error: 'Rating is required (1-5 stars)' })
    .int()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string()
    .trim()
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional()
    .default(''),
});

const createReportSchema = z.object({
  reportedUserId: z
    .string({ required_error: 'Reported user ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid reported User ID format'),
  reason: z
    .string({ required_error: 'Report reason is required' })
    .trim()
    .min(3, 'Reason must be at least 3 characters')
    .max(100, 'Reason cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .default(''),
});

module.exports = {
  createReviewSchema,
  createReportSchema,
};

