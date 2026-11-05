const { z } = require('zod');

const singleSlotSchema = z
  .object({
    dayOfWeek: z
      .number({ required_error: 'Day of week is required (0-6)' })
      .int()
      .min(0, 'Day must be between 0 (Sunday) and 6 (Saturday)')
      .max(6, 'Day must be between 0 (Sunday) and 6 (Saturday)'),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format (00:00 - 23:59)'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format (00:00 - 23:59)'),
    preferredDuration: z
      .number()
      .min(15, 'Duration must be at least 15 minutes')
      .max(240, 'Duration cannot exceed 240 minutes')
      .optional()
      .default(60),
    learningMode: z
      .enum(['ONLINE', 'IN_PERSON', 'HYBRID'])
      .optional()
      .default('ONLINE'),
    timezone: z.string().optional().default('UTC'),
    isActive: z.boolean().optional().default(true),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Start time must be strictly earlier than end time',
    path: ['endTime'],
  });

const bulkAvailabilitySchema = z.object({
  slots: z.array(singleSlotSchema),
});

module.exports = {
  singleSlotSchema,
  bulkAvailabilitySchema,
};

