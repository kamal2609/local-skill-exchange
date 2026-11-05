const { z } = require('zod');

const createSessionSchema = z
  .object({
    providerId: z
      .string({ required_error: 'Provider ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Provider ID format'),
    skillId: z
      .string({ required_error: 'Skill ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill ID format'),
    skillOfferId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Skill Offer ID format')
      .optional()
      .nullable(),
    learningRequestId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Learning Request ID format')
      .optional()
      .nullable(),
    bookingDate: z
      .string({ required_error: 'Booking date is required' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid booking date format',
      }),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'),
    duration: z
      .number()
      .min(15, 'Session duration must be at least 15 minutes')
      .max(240, 'Session duration cannot exceed 240 minutes')
      .optional()
      .default(60),
    notes: z
      .string()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional()
      .default(''),
    meetingLink: z
      .string()
      .max(500, 'Meeting link cannot exceed 500 characters')
      .optional()
      .default(''),
    isReciprocal: z
      .boolean()
      .optional()
      .default(false),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Start time must be strictly earlier than end time',
    path: ['endTime'],
  });

const updateSessionStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED'], {
    required_error: 'Status must be ACCEPTED, REJECTED, or CANCELLED',
  }),
  reason: z.string().max(500).optional().default(''),
});

module.exports = {
  createSessionSchema,
  updateSessionStatusSchema,
};

