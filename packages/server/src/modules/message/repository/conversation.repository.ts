import mongoose from 'mongoose';
import type { GroupUpdateInput, PaginatedResponse } from '@network/shared';
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

export const findById = (
  conversationId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findById(conversationId).exec();

export const isParticipant = async (
  userId: string,
  conversationId: string
): Promise<boolean> =>
  (await ConversationModel.exists({
    _id: conversationId,
    participantIds: userId,
  })) !== null;

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
    { new: true, runValidators: true }
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
    { new: true, runValidators: true }
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
    { new: true }
  ).exec();

export const updateLastReadAt = (
  conversationId: string,
  userId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { [`lastReadAt.${userId}`]: new Date() } },
    { new: true }
  ).exec();

export const touchLastMessageAt = (
  conversationId: string
): Promise<IConversationDocument | null> =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { lastMessageAt: new Date() } },
    { new: true }
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
