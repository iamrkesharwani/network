import { z } from 'zod';

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

    text: z
      .string()
      .trim()
      .max(2000, { message: 'Message text cannot exceed 2000 characters.' })
      .optional(),

    sharedVideoId: z
      .string()
      .min(1, { message: 'Invalid Shared Video ID.' })
      .optional(),
    sharedShortId: z
      .string()
      .min(1, { message: 'Invalid Shared Short ID.' })
      .optional(),
  })
  .refine((data) => data.conversationId || data.receiverId, {
    message:
      'Must provide either a conversationId (for existing chats) or a receiverId (to start a new 1:1 chat).',
  })
  .refine((data) => !(data.conversationId && data.receiverId), {
    message: 'Provide either a conversationId OR a receiverId, not both.',
  })
  .refine((data) => data.text || data.sharedVideoId || data.sharedShortId, {
    message:
      'Cannot send an empty message. Provide text or a shared media link.',
  });
