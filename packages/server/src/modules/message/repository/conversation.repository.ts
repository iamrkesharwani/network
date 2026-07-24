import mongoose from 'mongoose';
import type {
  ConversationDisappearingTtl,
  GroupUpdateInput,
  PaginatedResponse,
} from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import {
  ConversationModel,
  type IConversationDocument,
} from '../models/conversation.model.js';

interface MongoDuplicateKeyError {
  code?: number;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as MongoDuplicateKeyError).code === 11000;

const buildDirectKey = (userIdA: string, userIdB: string): string =>
  [userIdA, userIdB].sort().join('_');

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const encodeCursor = (doc: IConversationDocument): string =>
  Buffer.from(`${doc.lastMessageAt.getTime()}_${doc._id.toString()}`).toString(
    'base64url'
  );

const decodeCursor = (
  cursor: string
): { lastMessageAt: Date; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [timestamp, id] = decoded.split('_');
    if (!timestamp || !id || !mongoose.isValidObjectId(id)) return null;

    const ms = Number(timestamp);
    if (!Number.isFinite(ms)) return null;

    return { lastMessageAt: new Date(ms), id };
  } catch {
    return null;
  }
};

interface PinAwareConversationDoc extends IConversationDocument {
  isPinnedForViewer: boolean;
}

const encodePinAwareCursor = (doc: PinAwareConversationDoc): string =>
  Buffer.from(
    `${doc.isPinnedForViewer ? 1 : 0}_${doc.lastMessageAt.getTime()}_${doc._id.toString()}`
  ).toString('base64url');

const decodePinAwareCursor = (
  cursor: string
): { isPinned: boolean; lastMessageAt: Date; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [pinnedFlag, timestamp, id] = decoded.split('_');
    if (!pinnedFlag || !timestamp || !id || !mongoose.isValidObjectId(id)) {
      return null;
    }

    const ms = Number(timestamp);
    if (!Number.isFinite(ms)) return null;

    return { isPinned: pinnedFlag === '1', lastMessageAt: new Date(ms), id };
  } catch {
    return null;
  }
};

const isPinnedForViewerExpr = (userId: string) => ({
  $in: [
    userId,
    {
      $map: {
        input: { $objectToArray: { $ifNull: ['$pinnedAt', {}] } },
        as: 'entry',
        in: '$$entry.k',
      },
    },
  ],
});

export const findById = (
  conversationId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findById(conversationId).exec();

export const setModeratorLocked = (
  conversationId: string,
  isModeratorLocked: boolean
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { isModeratorLocked } },
    { returnDocument: 'after' }
  ).exec();

export const isParticipant = async (
  userId: string,
  conversationId: string
): Promise<boolean> =>
  (await ConversationModel.exists({
    _id: conversationId,
    participantIds: userId,
  })) !== null;

export const directExists = async (
  userIdA: string,
  userIdB: string
): Promise<boolean> => {
  const directKey = buildDirectKey(userIdA, userIdB);
  return (await ConversationModel.exists({ directKey })) !== null;
};

export const findDirectBetween = (
  userIdA: string,
  userIdB: string
): Promise<IConversationDocument | null> => {
  const directKey = buildDirectKey(userIdA, userIdB);
  return ConversationModel.findOne({ directKey }).exec();
};

export const findOrCreateDirect = async (
  userId: string,
  participantId: string
): Promise<IConversationDocument> => {
  const directKey = buildDirectKey(userId, participantId);

  const existing = await ConversationModel.findOne({ directKey }).exec();
  if (existing) return existing;

  try {
    return await ConversationModel.create({
      type: 'direct',
      participantIds: [userId, participantId],
      createdBy: userId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const doc = await ConversationModel.findOne({ directKey }).exec();
      if (doc) return doc;
    }
    throw error;
  }
};

export const createGroup = (
  userId: string,
  groupName: string,
  participantIds: string[]
): Promise<IConversationDocument> =>
  ConversationModel.create({
    type: 'group',
    participantIds: [userId, ...participantIds],
    groupName,
    createdBy: userId,
  });

export const listByUser = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<
  Omit<PaginatedResponse<IConversationDocument>, 'success' | 'message'>
> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodePinAwareCursor(cursor) : null;

  const pipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        participantIds: new mongoose.Types.ObjectId(userId),
        [`archivedAt.${userId}`]: { $exists: false },
        [`hiddenByBlockAt.${userId}`]: { $exists: false },
      },
    },
    { $addFields: { isPinnedForViewer: isPinnedForViewerExpr(userId) } },
  ];

  if (decoded) {
    pipeline.push({
      $match: {
        $or: [
          { isPinnedForViewer: { $lt: decoded.isPinned } },
          {
            isPinnedForViewer: decoded.isPinned,
            lastMessageAt: { $lt: decoded.lastMessageAt },
          },
          {
            isPinnedForViewer: decoded.isPinned,
            lastMessageAt: decoded.lastMessageAt,
            _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
          },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { isPinnedForViewer: -1, lastMessageAt: -1, _id: -1 } },
    { $limit: safeLimit + 1 }
  );

  const rawDocs = await ConversationModel.aggregate(pipeline).exec();
  const data = (await ConversationModel.populate(rawDocs, {
    path: 'participantIds',
    select: 'username name avatarUrl lastActiveAt status',
  })) as unknown as PinAwareConversationDoc[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodePinAwareCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const listArchivedByUser = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<
  Omit<PaginatedResponse<IConversationDocument>, 'success' | 'message'>
> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodeCursor(cursor) : null;

  const cursorFilter = decoded
    ? {
        $or: [
          { lastMessageAt: { $lt: decoded.lastMessageAt } },
          {
            lastMessageAt: decoded.lastMessageAt,
            _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
          },
        ],
      }
    : {};

  const data = (await ConversationModel.find({
    participantIds: userId,
    [`archivedAt.${userId}`]: { $exists: true },
    ...cursorFilter,
  })
    .sort({ lastMessageAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate('participantIds', 'username name avatarUrl lastActiveAt status')
    .lean()
    .exec()) as unknown as IConversationDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const addParticipants = (
  conversationId: string,
  participantIds: string[]
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $addToSet: { participantIds: { $each: participantIds } } },
    { returnDocument: 'after', runValidators: true }
  ).exec();

export const updateGroupMeta = (
  conversationId: string,
  data: GroupUpdateInput
): Promise<IConversationDocument | null> => {
  const set: Record<string, unknown> = {};
  if (data.groupName !== undefined) set['groupName'] = data.groupName;
  if (data.groupAvatarUrl !== undefined) {
    set['groupAvatarUrl'] = data.groupAvatarUrl;
  }

  return ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  ).exec();
};

export const leaveGroup = (
  conversationId: string,
  userId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      $pull: { participantIds: userId },
      $unset: { [`lastReadAt.${userId}`]: '' },
    },
    { returnDocument: 'after' }
  ).exec();

export const updateLastReadAt = (
  conversationId: string,
  userId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { [`lastReadAt.${userId}`]: new Date() } },
    { returnDocument: 'after' }
  ).exec();

export const setMuted = (
  conversationId: string,
  userId: string,
  mutedUntil: Date | null
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    mutedUntil
      ? { $set: { [`mutedUntil.${userId}`]: mutedUntil } }
      : { $unset: { [`mutedUntil.${userId}`]: '' } },
    { returnDocument: 'after' }
  ).exec();

export const setArchived = (
  conversationId: string,
  userId: string,
  archived: boolean
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    archived
      ? { $set: { [`archivedAt.${userId}`]: new Date() } }
      : { $unset: { [`archivedAt.${userId}`]: '' } },
    { returnDocument: 'after' }
  ).exec();

export const setPinned = (
  conversationId: string,
  userId: string,
  pinned: boolean
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    pinned
      ? { $set: { [`pinnedAt.${userId}`]: new Date() } }
      : { $unset: { [`pinnedAt.${userId}`]: '' } },
    { returnDocument: 'after' }
  ).exec();

export const setHiddenByBlock = (
  conversationId: string,
  userId: string,
  hidden: boolean
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    hidden
      ? { $set: { [`hiddenByBlockAt.${userId}`]: new Date() } }
      : { $unset: { [`hiddenByBlockAt.${userId}`]: '' } },
    { returnDocument: 'after' }
  ).exec();

export const setDisappearingTtl = (
  conversationId: string,
  ttl: ConversationDisappearingTtl
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { disappearingMessagesTtl: ttl } },
    { returnDocument: 'after' }
  ).exec();

export const touchLastMessageAt = (
  conversationId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { lastMessageAt: new Date() } },
    { returnDocument: 'after' }
  ).exec();

export const searchByUser = async (
  userId: string,
  query: string,
  limit: number
): Promise<IConversationDocument[]> => {
  const pattern = new RegExp(escapeRegex(query), 'i');
  const objectId = new mongoose.Types.ObjectId(userId);

  const rawDocs = await ConversationModel.aggregate([
    {
      $match: {
        participantIds: objectId,
        [`archivedAt.${userId}`]: { $exists: false },
        [`hiddenByBlockAt.${userId}`]: { $exists: false },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'participantIds',
        foreignField: '_id',
        as: 'participantDocs',
      },
    },
    {
      $addFields: {
        otherParticipantDocs: {
          $filter: {
            input: '$participantDocs',
            as: 'participant',
            cond: { $ne: ['$$participant._id', objectId] },
          },
        },
      },
    },
    {
      $match: {
        $or: [
          { groupName: pattern },
          { 'otherParticipantDocs.name': pattern },
          { 'otherParticipantDocs.username': pattern },
        ],
      },
    },
    { $sort: { lastMessageAt: -1 } },
    { $limit: limit },
  ]).exec();

  return ConversationModel.populate(rawDocs, {
    path: 'participantIds',
    select: 'username name avatarUrl lastActiveAt status',
  }) as unknown as Promise<IConversationDocument[]>;
};

export const markAllRead = (userId: string): Promise<unknown> =>
  ConversationModel.updateMany(
    { participantIds: userId },
    { $set: { [`lastReadAt.${userId}`]: new Date() } }
  ).exec();

export const findDistinctPartnerIds = async (
  userId: string
): Promise<string[]> => {
  const rows = await ConversationModel.aggregate<{
    _id: mongoose.Types.ObjectId;
  }>([
    { $match: { participantIds: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$participantIds' },
    {
      $match: { participantIds: { $ne: new mongoose.Types.ObjectId(userId) } },
    },
    { $group: { _id: '$participantIds' } },
  ]);

  return rows.map((row) => row._id.toString());
};
