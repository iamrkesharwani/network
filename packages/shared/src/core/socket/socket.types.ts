import type { VideoStatus } from '../../modules/video/video.types.js';
import type { ShortStatus } from '../../modules/short/short.types.js';
import type { PostStatus } from '../../modules/post/post.types.js';
import type { EngageableContentType } from '../contentRef/contentRef.types.js';
import type { INotificationListItem } from '../../modules/notification/notification.types.js';
import type {
  IMessageResponse,
  IConversationSummary,
  IMessageReactionEntry,
  MessageDeleteScope,
} from '../../modules/message/message.types.js';

export interface IMediaStatusEvent {
  mediaType: 'video' | 'short' | 'post';
  id: string;
  title?: string;
  status: VideoStatus | ShortStatus | PostStatus;
  playbackUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  errorMessage?: string;
  progress?: number;
}

export interface IUnlistedExpiryWarningEvent {
  mediaType: 'video' | 'short' | 'post';
  id: string;
  title?: string;
  daysLeft: number;
}

export interface IEngagementCountEvent {
  contentType: EngageableContentType;
  contentId: string;
  field: 'likes' | 'comments';
  count: number;
}

export type INotificationEvent = INotificationListItem;

export interface IUnreadCountEvent {
  count: number;
}

export type IMessageEvent = IMessageResponse;

export type IConversationUpdatedEvent = IConversationSummary;

export interface IConversationReadEvent {
  conversationId: string;
  userId: string;
  lastReadAt: string;
}

export interface IMessageDeletedEvent {
  conversationId: string;
  messageId: string;
  scope: MessageDeleteScope;
}

export interface IMessageReactionEvent {
  conversationId: string;
  messageId: string;
  userId: string;
  reaction: IMessageReactionEntry | null;
}

export interface IMessageEditedEvent {
  conversationId: string;
  messageId: string;
  ciphertext: string;
  iv: string;
  encryptedKeys: IMessageResponse['encryptedKeys'];
  editedAt: string;
}

export interface IMessageExpiredEvent {
  conversationId: string;
  messageId: string;
  expiredAt: string;
}

export interface IPresenceEvent {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}
