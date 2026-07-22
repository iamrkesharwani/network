import type { z } from 'zod';
import type {
  conversationTypeSchema,
  keyBundlePublicKeysQuerySchema,
  keyBundlePublishSchema,
  keyBundleUserIdParamSchema,
  directConversationCreateSchema,
  groupConversationCreateSchema,
  groupUpdateSchema,
  participantAddSchema,
  encryptedKeyEntrySchema,
  messageSendSchema,
  messageDeleteSchema,
  messageIdParamSchema,
  conversationIdParamSchema,
  conversationReadSchema,
  conversationRoomEventSchema,
  conversationListQuerySchema,
  messageListQuerySchema,
} from './message.schema.js';
import type {
  CONVERSATION_TYPES,
  MESSAGE_DELETE_SCOPES,
} from './message.constants.js';

export type ConversationType = (typeof CONVERSATION_TYPES)[number];
export type MessageDeleteScope = (typeof MESSAGE_DELETE_SCOPES)[number];

export type ConversationTypeInput = z.infer<typeof conversationTypeSchema>;
export type KeyBundlePublicKeysQuery = z.infer<
  typeof keyBundlePublicKeysQuerySchema
>;
export type KeyBundlePublishInput = z.infer<typeof keyBundlePublishSchema>;
export type KeyBundleUserIdParam = z.infer<typeof keyBundleUserIdParamSchema>;
export type DirectConversationCreateInput = z.infer<
  typeof directConversationCreateSchema
>;
export type GroupConversationCreateInput = z.infer<
  typeof groupConversationCreateSchema
>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;
export type ParticipantAddInput = z.infer<typeof participantAddSchema>;
export type EncryptedKeyEntryInput = z.infer<typeof encryptedKeyEntrySchema>;
export type MessageSendInput = z.infer<typeof messageSendSchema>;
export type MessageDeleteInput = z.infer<typeof messageDeleteSchema>;
export type MessageIdParam = z.infer<typeof messageIdParamSchema>;
export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>;
export type ConversationReadInput = z.infer<typeof conversationReadSchema>;
export type ConversationRoomEventInput = z.infer<
  typeof conversationRoomEventSchema
>;
export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;

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
}

export type IConversationSummary =
  | IDirectConversationSummary
  | IGroupConversationSummary;

export interface IMessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  iv: string;
  encryptedKeys: EncryptedKeyEntryInput[];
  createdAt: string;
  deliveredAt?: string;
  unsentAt?: string;
}
