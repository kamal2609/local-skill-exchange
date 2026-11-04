const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  city: z
    .string()
    .trim()
    .max(100, 'City cannot exceed 100 characters')
    .optional(),
  preferredLearningMode: z
    .enum(['ONLINE', 'IN_PERSON', 'HYBRID'])
    .optional(),
  languages: z
    .array(z.string().trim().min(1))
    .optional(),
  skillsOffered: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill ID'))
    .optional(),
  skillsWanted: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill ID'))
    .optional(),
  profilePicture: z
    .string()
    .nullable()
    .optional(),
});

module.exports = {
  updateProfileSchema,
};

