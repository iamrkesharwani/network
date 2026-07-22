import mongoose from 'mongoose';
import type { EncryptedKeyEntryInput, PaginatedResponse } from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import { MessageModel, type IMessageDocument } from '../models/message.model.js';

const encodeCursor = (doc: IMessageDocument): string =>
  Buffer.from(`${doc.createdAt.getTime()}_${doc._id.toString()}`).toString(
    'base64url'
  );

const decodeCursor = (
  cursor: string
): { createdAt: Date; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [timestamp, id] = decoded.split('_');
    if (!timestamp || !id || !mongoose.isValidObjectId(id)) return null;

    const ms = Number(timestamp);
    if (!Number.isFinite(ms)) return null;

    return { createdAt: new Date(ms), id };
  } catch {
    return null;
  }
};

export const findById = (
  messageId: string
): Promise<IMessageDocument | null> =>
  MessageModel.findById(messageId).exec();

export const insertMessage = (
  conversationId: string,
  senderId: string,
  ciphertext: string,
  iv: string,
  encryptedKeys: EncryptedKeyEntryInput[]
): Promise<IMessageDocument> =>
  MessageModel.create({
    conversationId,
    senderId,
    ciphertext,
    iv,
    encryptedKeys,
  });

export const listByConversation = async (
  conversationId: string,
  callerId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IMessageDocument>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodeCursor(cursor) : null;

  const cursorFilter = decoded
    ? {
        $or: [
          { createdAt: { $lt: decoded.createdAt } },
          {
            createdAt: decoded.createdAt,
            _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
          },
        ],
      }
    : {};

  const data = (await MessageModel.find({
    conversationId,
    'encryptedKeys.recipientId': callerId,
    deletedFor: { $ne: callerId },
    ...cursorFilter,
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .lean()
    .exec()) as IMessageDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const softDeleteForUser = (
  messageId: string,
  userId: string
): Promise<IMessageDocument | null> =>
  MessageModel.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedFor: userId } },
    { new: true }
  ).exec();

export const unsendForEveryone = (
  messageId: string
): Promise<IMessageDocument | null> =>
  MessageModel.findByIdAndUpdate(
    messageId,
    [
      {
        $set: {
          ciphertext: '',
          iv: '',
          unsentAt: '$$NOW',
          encryptedKeys: {
            $map: {
              input: '$encryptedKeys',
              as: 'entry',
              in: {
                recipientId: '$$entry.recipientId',
                encryptedKey: '',
              },
            },
          },
        },
      },
    ],
    { new: true }
  ).exec();
