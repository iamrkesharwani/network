import mongoose from 'mongoose';
import type { PaginatedResponse, HistoryContentType } from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import { HistoryModel, type IHistoryDocument } from './history.model.js';

const CONTENT_MODEL_BY_TYPE: Record<HistoryContentType, 'Video' | 'Short'> = {
  video: 'Video',
  short: 'Short',
};

const encodeCursor = (doc: IHistoryDocument): string =>
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

export const upsertProgress = async (
  userId: string,
  contentType: HistoryContentType,
  contentId: string,
  currentTime: number,
  duration?: number
): Promise<IHistoryDocument> => {
  const doc = await HistoryModel.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      contentType,
      contentId: new mongoose.Types.ObjectId(contentId),
    },
    {
      $set: {
        currentTime,
        contentModel: CONTENT_MODEL_BY_TYPE[contentType],
        ...(duration !== undefined && { duration }),
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  ).exec();

  return doc as IHistoryDocument;
};

export const findByUserPaginated = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IHistoryDocument>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodeCursor(cursor) : null;

  const cursorFilter = decoded
    ? {
        $or: [
          { updatedAt: { $lt: decoded.updatedAt } },
          {
            updatedAt: decoded.updatedAt,
            _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
          },
        ],
      }
    : {};

  const data = (await HistoryModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    ...cursorFilter,
  })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate('contentId')
    .lean()
    .exec()) as IHistoryDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const findByUserAndContent = (
  userId: string,
  contentType: HistoryContentType,
  contentId: string
): Promise<IHistoryDocument | null> =>
  HistoryModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
  }).exec();

export const findById = (id: string): Promise<IHistoryDocument | null> =>
  HistoryModel.findById(id).exec();

export const deleteById = (id: string): Promise<IHistoryDocument | null> =>
  HistoryModel.findByIdAndDelete(id).exec();

export const deleteAllByUserId = async (userId: string): Promise<void> => {
  await HistoryModel.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
  }).exec();
};
