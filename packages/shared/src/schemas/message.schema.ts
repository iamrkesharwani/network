import { z } from 'zod';

const base64Schema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9+/]+=*$/, { message: 'Value must be valid base64.' });

const ivSchema = z
  .string()
  .length(16, { message: 'IV must be 16 base64 characters (12 bytes).' })
  .regex(/^[A-Za-z0-9+/]+=*$/, { message: 'IV must be valid base64.' });

export const MESSAGE_TYPES = ['text', 'sharedVideo', 'sharedShort'] as const;

export const groupCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Group name must be at least 3 characters.' })
    .max(50, { message: 'Group name cannot exceed 50 characters.' }),

  participantIds: z
    .array(z.string().min(1, { message: 'Invalid participant ID.' }))
    .min(2, { message: 'A group must have at least 2 other participants.' })
    .max(50, {
      message: 'A group cannot exceed 50 participants to maintain performance.',
    }),
});

export const groupUpdateSchema = z.object({
  name: groupCreateSchema.shape.name.optional(),
  addParticipantIds: z.array(z.string().min(1)).max(10).optional(),
  removeParticipantIds: z.array(z.string().min(1)).max(10).optional(),
});

export const messageSendSchema = z
  .object({
    conversationId: z
      .string()
      .min(1, { message: 'Invalid Conversation ID.' })
      .optional(),

    receiverId: z
      .string()
      .min(1, { message: 'Invalid Receiver ID.' })
      .optional(),

    messageType: z.enum(MESSAGE_TYPES, {
      message: 'Invalid message type.',
    }),

    ciphertext: base64Schema.max(4096, {
      message: 'Ciphertext exceeds maximum allowed size.',
    }),

    iv: ivSchema,

    encryptedKeys: z
      .record(
        z.string().min(1),
        z.string().min(1, { message: 'Encrypted key cannot be empty.' })
      )
      .refine((v) => Object.keys(v).length >= 1, {
        message: 'Must include at least one recipient key.',
      }),
  })
  .refine((data) => data.conversationId || data.receiverId, {
    message:
      'Must provide either a conversationId (for existing chats) or a receiverId (to start a new 1:1 chat).',
    path: ['conversationId'],
  })
  .refine((data) => !(data.conversationId && data.receiverId), {
    message: 'Provide either a conversationId OR a receiverId, not both.',
    path: ['receiverId'],
  });
