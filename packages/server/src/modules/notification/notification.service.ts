import type {
  NotificationType,
  NotificationTargetType,
  INotificationListItem,
  PaginatedResponse,
  PushSubscriptionCreateInput,
} from '@network/shared';
import {
  NOTIFICATION_TYPE_CATEGORY_MAP,
  NOTIFICATION_NEW_SOCKET_EVENT,
  NOTIFICATION_UNREAD_COUNT_SOCKET_EVENT,
} from '@network/shared';
import * as notificationRepository from './notification.repository.js';
import * as pushSubscriptionRepository from './pushSubscription.repository.js';
import { toListItem } from './notification.mappers.js';
import { buildNotificationCopy } from './notification.copy.js';
import { sendWebPush } from './notification.push.service.js';
import * as preferencesService from '../preferences/preferences.service.js';
import * as userRepository from '../user/user.repository.js';
import { emitToUser } from '../../core/config/socket.js';
import { queueGenericEmail } from '../email/queue.js';
import { ApiError } from '../../core/utils/ApiError.js';

export interface DispatchNotificationPayload {
  type: NotificationType;
  recipientId: string;
  actorId?: string;
  targetType: NotificationTargetType;
  targetId?: string;
}

export const dispatchNotification = async (
  payload: DispatchNotificationPayload
): Promise<void> => {
  if (payload.actorId && payload.actorId === payload.recipientId) return;

  const category = NOTIFICATION_TYPE_CATEGORY_MAP[payload.type];
  const preferences = await preferencesService.getPreferences(
    payload.recipientId
  );

  const doc = await notificationRepository.upsertGroupedNotification({
    recipientId: payload.recipientId,
    type: payload.type,
    category,
    ...(payload.actorId && { actorId: payload.actorId }),
    targetType: payload.targetType,
    ...(payload.targetId && { targetId: payload.targetId }),
  });

  await doc.populate('actorIds', 'username name avatarUrl');
  const item = toListItem(doc);

  emitToUser(payload.recipientId, NOTIFICATION_NEW_SOCKET_EVENT, item);
  const unreadCount = await notificationRepository.countUnread(
    payload.recipientId
  );
  emitToUser(payload.recipientId, NOTIFICATION_UNREAD_COUNT_SOCKET_EVENT, {
    count: unreadCount,
  });

  const pushEnabled = preferences.notifications.push?.[category] ?? true;
  if (pushEnabled) {
    const copy = buildNotificationCopy(item);
    await sendWebPush(payload.recipientId, {
      title: copy.title,
      body: copy.body,
    });
  }

  const emailEnabled = preferences.notifications.email?.[category] ?? false;
  if (emailEnabled) {
    const recipient = await userRepository.findById(payload.recipientId);
    if (recipient) {
      const copy = buildNotificationCopy(item);
      await queueGenericEmail({
        to: recipient.email,
        subject: copy.title,
        html: `<p>${copy.body}</p>`,
      });
    }
  }
};

export const listNotifications = async (
  recipientId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<INotificationListItem>, 'success' | 'message'>> => {
  const result = await notificationRepository.findForUserPaginated(
    recipientId,
    cursor,
    limit
  );
  return { ...result, data: result.data.map(toListItem) };
};

export const getUnreadCount = (recipientId: string): Promise<number> =>
  notificationRepository.countUnread(recipientId);

export const markAsRead = async (
  notificationId: string,
  recipientId: string
): Promise<void> => {
  const updated = await notificationRepository.markRead(
    notificationId,
    recipientId
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Notification not found.');
  }
};

export const markAllAsRead = (recipientId: string): Promise<number> =>
  notificationRepository.markAllRead(recipientId);

export const savePushSubscription = (
  userId: string,
  input: PushSubscriptionCreateInput
): Promise<void> =>
  pushSubscriptionRepository
    .upsertByEndpoint(userId, input.endpoint, input.keys, input.userAgent)
    .then(() => undefined);

export const removePushSubscription = (endpoint: string): Promise<void> =>
  pushSubscriptionRepository.deleteByEndpoint(endpoint);
