const { z } = require('zod');

const createRequestSchema = z.object({
  skillId: z
    .string({ required_error: 'Skill ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill ID format'),
  title: z
    .string({ required_error: 'Request title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z
    .string({ required_error: 'Request description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  learningObjectives: z
    .string()
    .max(500, 'Objectives cannot exceed 500 characters')
    .optional()
    .default(''),
  preferredDifficulty: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'])
    .optional()
    .default('ALL_LEVELS'),
  preferredDuration: z
    .number()
    .min(15, 'Preferred duration must be at least 15 minutes')
    .max(240, 'Preferred duration cannot exceed 240 minutes')
    .optional()
    .default(60),
  preferredMode: z
    .enum(['ONLINE', 'IN_PERSON', 'HYBRID'])
    .optional()
    .default('ONLINE'),
  preferredSchedule: z
    .string()
    .trim()
    .optional()
    .default('Flexible'),
  neighborhood: z
    .string()
    .trim()
    .optional()
    .default(''),
});

const updateRequestSchema = createRequestSchema.partial().extend({
  status: z
    .enum(['OPEN', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'])
    .optional(),
});

module.exports = {
  createRequestSchema,
  updateRequestSchema,
};

