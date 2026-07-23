import type { z } from 'zod';
import type {
  conversationTypeSchema,
  keyBundlePublicKeysQuerySchema,
  keyBundlePublishSchema,
  keyBundleUserIdParamSchema,
  keyOtpConfirmSchema,
  keyRecoveryConfirmSchema,
  keyRotateSchema,
  keyHistoryRewrapSchema,
  directConversationCreateSchema,
  groupConversationCreateSchema,
  groupUpdateSchema,
  participantAddSchema,
  messageSendSchema,
  messageDeleteSchema,
  messageReactionSetSchema,
  messageEditSchema,
  messageIdParamSchema,
  conversationIdParamSchema,
  conversationReadSchema,
  conversationRoomEventSchema,
  conversationMuteSchema,
  conversationDisappearingTtlSchema,
  conversationListQuerySchema,
  messageListQuerySchema,
  messageAttachmentUploadSchema,
} from './message.schema.js';
import type {
  CONVERSATION_TYPES,
  MESSAGE_DELETE_SCOPES,
  MESSAGE_MUTE_DURATIONS,
  MESSAGE_PIN_LENGTHS,
  MESSAGE_DISAPPEARING_TTL_OPTIONS,
  MESSAGE_ATTACHMENT_TYPES,
} from './message.constants.js';

export type ConversationType = (typeof CONVERSATION_TYPES)[number];
export type MessageDeleteScope = (typeof MESSAGE_DELETE_SCOPES)[number];
export type ConversationMuteDuration = (typeof MESSAGE_MUTE_DURATIONS)[number];
export type MessagePinLength = (typeof MESSAGE_PIN_LENGTHS)[number];
export type ConversationDisappearingTtl =
  (typeof MESSAGE_DISAPPEARING_TTL_OPTIONS)[number];
export type MessageAttachmentType = (typeof MESSAGE_ATTACHMENT_TYPES)[number];

export type ConversationTypeInput = z.infer<typeof conversationTypeSchema>;
export type KeyBundlePublicKeysQuery = z.infer<
  typeof keyBundlePublicKeysQuerySchema
>;
export type KeyBundlePublishInput = z.infer<typeof keyBundlePublishSchema>;
export type KeyRotateInput = z.infer<typeof keyRotateSchema>;
export type KeyHistoryRewrapInput = z.infer<typeof keyHistoryRewrapSchema>;
export type KeyBundleUserIdParam = z.infer<typeof keyBundleUserIdParamSchema>;
export type KeyOtpConfirmInput = z.infer<typeof keyOtpConfirmSchema>;
export type KeyRecoveryConfirmInput = z.infer<typeof keyRecoveryConfirmSchema>;
export type DirectConversationCreateInput = z.infer<
  typeof directConversationCreateSchema
>;
export type GroupConversationCreateInput = z.infer<
  typeof groupConversationCreateSchema
>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;
export type ParticipantAddInput = z.infer<typeof participantAddSchema>;
export type MessageSendInput = z.infer<typeof messageSendSchema>;
export type MessageDeleteInput = z.infer<typeof messageDeleteSchema>;
export type MessageReactionSetInput = z.infer<typeof messageReactionSetSchema>;
export type MessageEditInput = z.infer<typeof messageEditSchema>;
export type MessageIdParam = z.infer<typeof messageIdParamSchema>;
export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>;
export type ConversationReadInput = z.infer<typeof conversationReadSchema>;
export type ConversationRoomEventInput = z.infer<
  typeof conversationRoomEventSchema
>;
export type ConversationMuteInput = z.infer<typeof conversationMuteSchema>;
export type ConversationDisappearingTtlInput = z.infer<
  typeof conversationDisappearingTtlSchema
>;
export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
export type MessageAttachmentUploadInput = z.infer<
  typeof messageAttachmentUploadSchema
>;

export interface IKeyBundlePublicResponse {
  userId: string;
  publicKey: string;
  keyVersion: number;
}

export interface IKeyBundleOwnResponse {
  publicKey: string;
  wrappedPrivateKey: string;
  wrapIv: string;
  wrapSalt: string;
  pbkdf2Iterations: number;
  keyVersion: number;
}

export interface IKeyBundleRecoveryResponse {
  recoveryWrappedPrivateKey: string;
  recoveryWrapIv: string;
  recoveryWrapSalt: string;
  recoveryPbkdf2Iterations: number;
}

/**
 * A retired keypair from a past rotation. Wrapped under the same
 * account-password/passphrase mechanism as the active key (kept in sync by
 * the password-change re-wrap flow) - deliberately has no separate
 * recovery-token wrap of its own, unlike the active bundle. A lost device
 * that never unlocked messaging before the loss won't recover history
 * predating that gap; this is a documented scope limit, not an oversight.
 */
export interface IKeyBundleHistoryEntryResponse {
  keyVersion: number;
  wrappedPrivateKey: string;
  wrapIv: string;
  wrapSalt: string;
  pbkdf2Iterations: number;
  retiredAt: string;
}

export interface IParticipantSummary {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

export interface IConversationSummaryBase {
  id: string;
  type: ConversationType;
  lastMessageAt: string;
  isUnread: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  disappearingMessagesTtl: ConversationDisappearingTtl;
  /** participantId -> ISO timestamp of their last read, for whichever participants have read at least once. Powers "Seen by ..." indicators client-side. */
  participantReadState: Record<string, string>;
}

export interface IDirectConversationSummary extends IConversationSummaryBase {
  type: 'direct';
  otherParticipant: IParticipantSummary;
}

export interface IGroupConversationSummary extends IConversationSummaryBase {
  type: 'group';
  groupName: string;
  groupAvatarUrl?: string;
  participants: IParticipantSummary[];
  isOwnedByViewer: boolean;
}

export type IConversationSummary =
  | IDirectConversationSummary
  | IGroupConversationSummary;

/**
 * Client-side-only shape: bundled into the encrypted message payload's
 * plaintext, never sent to the server as a separate field.
 */
export interface IMessageLinkPreview {
  provider: string;
  url: string;
  title: string;
  authorName?: string;
  thumbnailUrl?: string;
}

export interface IMessageAttachmentUploadResult {
  storageKey: string;
}

export interface IMessageReactionEntry {
  userId: string;
  content: string;
  createdAt: string;
}

export interface IMessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  reactions: IMessageReactionEntry[];
  replyToMessageId?: string;
  createdAt: string;
  editedAt?: string;
  expiresAt?: string;
  expiredAt?: string;
  moderationRemovedAt?: string;
  deliveredAt?: string;
  unsentAt?: string;
  attachmentType?: MessageAttachmentType;
  attachmentMimeType?: string;
  attachmentSize?: number;
  attachmentDuration?: number;
}
