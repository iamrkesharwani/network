import { z } from 'zod';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';
import { mongoIdSchema } from '../../core/contentRef/contentRef.schema.js';
import { otpCodeSchema } from '../auth/auth.schema.js';
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
  KEY_BUNDLE_PBKDF2_MIN_ITERATIONS,
  KEY_BUNDLE_PUBLIC_KEY_MAX_LENGTH,
  KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH,
  KEY_BUNDLE_WRAP_IV_MAX_LENGTH,
  KEY_BUNDLE_WRAP_SALT_MAX_LENGTH,
  KEY_BUNDLE_RECOVERY_TOKEN_MAX_LENGTH,
} from './message.constants.js';

export const conversationTypeSchema = z.enum(CONVERSATION_TYPES);

export const keyBundlePublicKeysQuerySchema = z.object({
  userIds: z.string().min(1),
});

const wrappedPrivateKeySchema = z
  .string()
  .min(1)
  .max(KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH);
const wrapIvSchema = z.string().min(1).max(KEY_BUNDLE_WRAP_IV_MAX_LENGTH);
const wrapSaltSchema = z.string().min(1).max(KEY_BUNDLE_WRAP_SALT_MAX_LENGTH);
const pbkdf2IterationsSchema = z
  .number()
  .int()
  .min(KEY_BUNDLE_PBKDF2_MIN_ITERATIONS);

export const keyBundlePublishSchema = z
  .object({
    publicKey: z.string().min(1).max(KEY_BUNDLE_PUBLIC_KEY_MAX_LENGTH),
    wrappedPrivateKey: wrappedPrivateKeySchema,
    wrapIv: wrapIvSchema,
    wrapSalt: wrapSaltSchema,
    pbkdf2Iterations: pbkdf2IterationsSchema,
    recoveryWrappedPrivateKey: wrappedPrivateKeySchema.optional(),
    recoveryWrapIv: wrapIvSchema.optional(),
    recoveryWrapSalt: wrapSaltSchema.optional(),
    recoveryPbkdf2Iterations: pbkdf2IterationsSchema.optional(),
    recoveryToken: z
      .string()
      .min(1)
      .max(KEY_BUNDLE_RECOVERY_TOKEN_MAX_LENGTH)
      .optional(),
  })
  .refine(
    (data) => {
      const recoveryFields = [
        data.recoveryWrappedPrivateKey,
        data.recoveryWrapIv,
        data.recoveryWrapSalt,
        data.recoveryPbkdf2Iterations,
        data.recoveryToken,
      ];
      const providedCount = recoveryFields.filter(
        (field) => field !== undefined
      ).length;
      return providedCount === 0 || providedCount === recoveryFields.length;
    },
    { message: 'Recovery fields must all be provided together.' }
  );

// Rotating publishes a new active key the exact same way setup/reset does -
// the server tells them apart by which endpoint was hit, not by wire shape.
export const keyRotateSchema = keyBundlePublishSchema;

const keyHistoryRewrapEntrySchema = z.object({
  keyVersion: z.number().int().nonnegative(),
  wrappedPrivateKey: wrappedPrivateKeySchema,
  wrapIv: wrapIvSchema,
  wrapSalt: wrapSaltSchema,
  pbkdf2Iterations: pbkdf2IterationsSchema,
});

export const keyHistoryRewrapSchema = z.object({
  entries: z.array(keyHistoryRewrapEntrySchema),
});

export const keyRecoveryConfirmSchema = z.object({
  recoveryToken: z.string().min(1).max(KEY_BUNDLE_RECOVERY_TOKEN_MAX_LENGTH),
});

export const keyBundleUserIdParamSchema = z.object({
  userId: mongoIdSchema,
});

export const keyOtpConfirmSchema = z.object({
  otp: otpCodeSchema,
});

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
