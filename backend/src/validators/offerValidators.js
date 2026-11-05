const { z } = require('zod');

const createOfferSchema = z.object({
  skillId: z
    .string({ required_error: 'Skill ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill ID format'),
  description: z
    .string({ required_error: 'Offer description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  experienceLevel: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .optional()
    .default('INTERMEDIATE'),
  teachingLanguage: z
    .string()
    .trim()
    .optional()
    .default('English'),
  learningMode: z
    .enum(['ONLINE', 'IN_PERSON', 'HYBRID'])
    .optional()
    .default('ONLINE'),
  sessionDuration: z
    .number()
    .min(15, 'Session must be at least 15 minutes')
    .max(240, 'Session cannot exceed 240 minutes')
    .optional()
    .default(60),
  neighborhood: z
    .string()
    .trim()
    .optional()
    .default(''),
  teachingApproach: z
    .string()
    .max(500, 'Teaching approach cannot exceed 500 characters')
    .optional()
    .default(''),
});

const updateOfferSchema = createOfferSchema.partial().extend({
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
});

module.exports = {
  createOfferSchema,
  updateOfferSchema,
};

