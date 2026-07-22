import type { VideoStatus } from '../../modules/video/video.types.js';
import type { ShortStatus } from '../../modules/short/short.types.js';
import type { PostStatus } from '../../modules/post/post.types.js';
import type { EngageableContentType } from '../contentRef/contentRef.types.js';
import type { INotificationListItem } from '../../modules/notification/notification.types.js';
import type {
  IMessageResponse,
  IConversationSummary,
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

export interface IPresenceEvent {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}
