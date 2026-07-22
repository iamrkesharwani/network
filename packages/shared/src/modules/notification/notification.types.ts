import type { z } from 'zod';
import type {
  notificationListQuerySchema,
  notificationIdParamSchema,
  pushSubscriptionCreateSchema,
  pushSubscriptionDeleteSchema,
} from './notification.schema.js';
import type { NOTIFICATION_TYPES, NOTIFICATION_TARGET_TYPES } from './notification.constants.js';
import type { PreferencesNotificationCategory } from '../preferences/preferences.types.js';

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationTargetType =
  (typeof NOTIFICATION_TARGET_TYPES)[number];

export type NotificationListQuery = z.infer<
  typeof notificationListQuerySchema
>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type PushSubscriptionCreateInput = z.infer<
  typeof pushSubscriptionCreateSchema
>;
export type PushSubscriptionDeleteInput = z.infer<
  typeof pushSubscriptionDeleteSchema
>;

export interface INotificationActorSummary {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
}

export interface INotificationTargetPreview {
  title?: string;
  thumbnailUrl?: string;
}

export interface INotificationListItem {
  id: string;
  type: NotificationType;
  category: PreferencesNotificationCategory;
  actors: INotificationActorSummary[];
  actorCount: number;
  targetType: NotificationTargetType;
  targetId?: string;
  targetPreview?: INotificationTargetPreview;
  isRead: boolean;
  createdAt: string;
}

export interface IUnreadCountResponse {
  count: number;
}
