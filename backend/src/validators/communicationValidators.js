const { z } = require('zod');

const createConversationSchema = z.object({
  recipientId: z
    .string({ required_error: 'Recipient ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid recipient ID format'),
  initialMessage: z.string().trim().max(2000).optional(),
});

const sendMessageSchema = z.object({
  text: z
    .string({ required_error: 'Message text is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

module.exports = {
  createConversationSchema,
  sendMessageSchema,
};

