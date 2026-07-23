import { z } from 'zod';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';
import { mongoIdSchema } from '../../core/contentRef/contentRef.schema.js';
import {
  CONVERSATION_TYPES,
  GROUP_NAME_MAX_LENGTH,
  MESSAGE_GROUP_MAX_PARTICIPANTS,
  MESSAGE_CONTENT_MAX_LENGTH,
  MESSAGE_REACTION_CONTENT_MAX_LENGTH,
  MESSAGE_DELETE_SCOPES,
  MESSAGE_MUTE_DURATIONS,
  MESSAGE_DISAPPEARING_TTL_OPTIONS,
  MESSAGE_ATTACHMENT_STORAGE_KEY_MAX_LENGTH,
} from './message.constants.js';

export const conversationTypeSchema = z.enum(CONVERSATION_TYPES);

export const directConversationCreateSchema = z.object({
  participantId: mongoIdSchema,
});

export const groupConversationCreateSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(1, 'Group name is required.')
    .max(
      GROUP_NAME_MAX_LENGTH,
      `Group name cannot exceed ${GROUP_NAME_MAX_LENGTH} characters.`
    ),
  participantIds: z
    .array(mongoIdSchema)
    .min(2, 'A group needs at least 2 other participants.')
    .max(
      MESSAGE_GROUP_MAX_PARTICIPANTS - 1,
      `A group cannot exceed ${MESSAGE_GROUP_MAX_PARTICIPANTS} participants.`
    ),
});

export const groupUpdateSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(1, 'Group name is required.')
    .max(
      GROUP_NAME_MAX_LENGTH,
      `Group name cannot exceed ${GROUP_NAME_MAX_LENGTH} characters.`
    )
    .optional(),
  groupAvatarUrl: z
    .url('Group avatar must be a valid URL.')
    .startsWith('https://', 'Group avatar URL must use HTTPS.')
    .optional(),
});

export const participantAddSchema = z.object({
  participantIds: z
    .array(mongoIdSchema)
    .min(1, 'Select at least one participant to add.')
    .max(MESSAGE_GROUP_MAX_PARTICIPANTS - 1),
});

export const messageSendSchema = z.object({
  conversationId: mongoIdSchema,
  content: z.string().min(1).max(MESSAGE_CONTENT_MAX_LENGTH),
  replyToMessageId: mongoIdSchema.optional(),
  ttlOverride: z.enum(MESSAGE_DISAPPEARING_TTL_OPTIONS).optional(),
  attachmentStorageKey: z
    .string()
    .min(1)
    .max(MESSAGE_ATTACHMENT_STORAGE_KEY_MAX_LENGTH)
    .optional(),
});

export const messageAttachmentUploadSchema = z.object({
  conversationId: mongoIdSchema,
});

export const messageDeleteSchema = z.object({
  scope: z.enum(MESSAGE_DELETE_SCOPES),
});

export const messageReactionSetSchema = z.object({
  content: z.string().min(1).max(MESSAGE_REACTION_CONTENT_MAX_LENGTH),
});

export const messageEditSchema = z.object({
  content: z.string().min(1).max(MESSAGE_CONTENT_MAX_LENGTH),
});

export const messageIdParamSchema = z.object({
  messageId: mongoIdSchema,
});

export const conversationIdParamSchema = z.object({
  conversationId: mongoIdSchema,
});

export const conversationReadSchema = z.object({
  conversationId: mongoIdSchema,
});

export const conversationRoomEventSchema = z.object({
  conversationId: mongoIdSchema,
});

export const conversationMuteSchema = z.object({
  duration: z.enum(MESSAGE_MUTE_DURATIONS),
});

export const conversationDisappearingTtlSchema = z.object({
  ttl: z.enum(MESSAGE_DISAPPEARING_TTL_OPTIONS),
});

export const conversationListQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const messageListQuerySchema = conversationListQuerySchema;
