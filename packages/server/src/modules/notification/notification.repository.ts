import mongoose from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import {
  MAX_PAGE_LIMIT,
  NOTIFICATION_GROUP_MAX_ACTORS,
  type NotificationType,
  type NotificationTargetType,
  type PreferencesNotificationCategory,
  type ContentType,
} from '@network/shared';
import { NotificationModel, type INotificationDocument } from './notification.model.js';

const buildGroupKey = (
  recipientId: string,
  type: NotificationType,
  targetType: NotificationTargetType,
  targetId?: string | null
): string => `${recipientId}:${type}:${targetType}:${targetId ?? 'none'}`;

interface UpsertGroupedNotificationParams {
  recipientId: string;
  type: NotificationType;
  category: PreferencesNotificationCategory;
  actorId?: string;
  targetType: NotificationTargetType;
  targetId?: string | null;
  contentType?: ContentType;
  contentId?: string;
  topLevelCommentId?: string;
}

export const upsertGroupedNotification = async (
  params: UpsertGroupedNotificationParams
): Promise<INotificationDocument> => {
  const groupKey = buildGroupKey(
    params.recipientId,
    params.type,
    params.targetType,
    params.targetId
  );

  const baseSet = {
    recipientId: new mongoose.Types.ObjectId(params.recipientId),
    type: params.type,
    category: params.category,
    groupKey,
    targetType: params.targetType,
    targetId: params.targetId ?? null,
    contentType: params.contentType ?? null,
    contentId: params.contentId ?? null,
    topLevelCommentId: params.topLevelCommentId ?? null,
    isRead: false,
    readAt: null,
    createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
    updatedAt: '$$NOW',
  };

  const actorSet = params.actorId
    ? (() => {
        const actorObjectId = new mongoose.Types.ObjectId(params.actorId);
        return {
          actorIds: {
            $cond: [
              { $in: [actorObjectId, { $ifNull: ['$actorIds', []] }] },
              { $ifNull: ['$actorIds', []] },
              {
                $slice: [
                  {
                    $concatArrays: [
                      [actorObjectId],
                      { $ifNull: ['$actorIds', []] },
                    ],
                  },
                  NOTIFICATION_GROUP_MAX_ACTORS,
                ],
              },
            ],
          },
          actorCount: {
            $cond: [
              { $in: [actorObjectId, { $ifNull: ['$actorIds', []] }] },
              { $ifNull: ['$actorCount', 1] },
              { $add: [{ $ifNull: ['$actorCount', 0] }, 1] },
            ],
          },
        };
      })()
    : {
        actorIds: { $ifNull: ['$actorIds', []] },
        actorCount: { $ifNull: ['$actorCount', 0] },
      };

  const updated = await NotificationModel.findOneAndUpdate(
    { groupKey, isRead: false },
    [{ $set: { ...baseSet, ...actorSet } }],
    { upsert: true, returnDocument: 'after', updatePipeline: true }
  ).exec();

  return updated as INotificationDocument;
};

const encodeCursor = (doc: INotificationDocument): string =>
  Buffer.from(`${doc.updatedAt.getTime()}_${doc._id.toString()}`).toString(
    'base64url'
  );

const decodeCursor = (
  cursor: string
): { updatedAt: Date; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [timestamp, id] = decoded.split('_');
    if (!timestamp || !id || !mongoose.isValidObjectId(id)) return null;

    const ms = Number(timestamp);
    if (!Number.isFinite(ms)) return null;

    return { updatedAt: new Date(ms), id };
  } catch {
    return null;
  }
};

const buildCursorFilter = (cursor: string | null) => {
  const decoded = cursor ? decodeCursor(cursor) : null;
  if (!decoded) return {};

  return {
    $or: [
      { updatedAt: { $lt: decoded.updatedAt } },
      {
        updatedAt: decoded.updatedAt,
        _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
      },
    ],
  };
};

export const findForUserPaginated = async (
  recipientId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<INotificationDocument>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);

  const data = (await NotificationModel.find({
    recipientId: new mongoose.Types.ObjectId(recipientId),
    ...buildCursorFilter(cursor),
  })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate('actorIds', 'username name avatarUrl')
    .lean()
    .exec()) as INotificationDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const countUnread = (recipientId: string): Promise<number> =>
  NotificationModel.countDocuments({
    recipientId: new mongoose.Types.ObjectId(recipientId),
    isRead: false,
  }).exec();

export const markRead = (
  notificationId: string,
  recipientId: string
): Promise<INotificationDocument | null> =>
  NotificationModel.findOneAndUpdate(
    {
      _id: notificationId,
      recipientId: new mongoose.Types.ObjectId(recipientId),
    },
    { isRead: true, readAt: new Date() },
    { returnDocument: 'after' }
  ).exec();

export const markAllRead = async (recipientId: string): Promise<number> => {
  const result = await NotificationModel.updateMany(
    {
      recipientId: new mongoose.Types.ObjectId(recipientId),
      isRead: false,
    },
    { isRead: true, readAt: new Date() }
  ).exec();

  return result.modifiedCount;
};

export const deleteReadOlderThan = async (cutoff: Date): Promise<number> => {
  const result = await NotificationModel.deleteMany({
    isRead: true,
    readAt: { $lte: cutoff },
  }).exec();

  return result.deletedCount;
};
