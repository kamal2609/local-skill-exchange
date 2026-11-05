const { z } = require('zod');

const createSkillSchema = z.object({
  name: z
    .string({ required_error: 'Skill name is required' })
    .trim()
    .min(2, 'Skill name must be at least 2 characters')
    .max(100, 'Skill name cannot exceed 100 characters'),
  category: z.enum(
    ['Technology', 'Design', 'Academic', 'Creative', 'Lifestyle', 'Other'],
    { required_error: 'Please select a valid skill category' }
  ),
  description: z
    .string({ required_error: 'Skill description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  difficulty: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'])
    .optional()
    .default('ALL_LEVELS'),
  tags: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),
  icon: z
    .string()
    .trim()
    .optional()
    .default('BookOpen'),
});

const updateSkillSchema = createSkillSchema.partial();

module.exports = {
  createSkillSchema,
  updateSkillSchema,
};
