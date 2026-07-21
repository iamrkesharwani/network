import mongoose from 'mongoose';
import type { BookmarkableContentType, PaginatedResponse } from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import { BookmarkModel, type IBookmarkDocument } from './bookmark.model.js';

interface MongoDuplicateKeyError {
  code?: number;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as MongoDuplicateKeyError).code === 11000;

const encodeCursor = (doc: IBookmarkDocument): string =>
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

export const toggle = async (
  userId: string,
  contentType: BookmarkableContentType,
  contentId: string
): Promise<{ bookmarked: boolean }> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const contentObjectId = new mongoose.Types.ObjectId(contentId);

  const existing = await BookmarkModel.findOneAndDelete({
    userId: userObjectId,
    contentType,
    contentId: contentObjectId,
  }).exec();

  if (existing) {
    return { bookmarked: false };
  }

  try {
    await BookmarkModel.create({
      userId: userObjectId,
      contentType,
      contentId: contentObjectId,
    });
    return { bookmarked: true };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { bookmarked: true };
    }
    throw error;
  }
};

export const getUserBookmarkedSet = async (
  userId: string,
  contentType: BookmarkableContentType,
  contentIds: string[]
): Promise<Set<string>> => {
  const docs = await BookmarkModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    contentType,
    contentId: {
      $in: contentIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  })
    .select('contentId')
    .lean()
    .exec();

  return new Set(docs.map((doc) => doc.contentId.toString()));
};

export const findByUserPaginated = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IBookmarkDocument>, 'success' | 'message'>> => {
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

  const data = (await BookmarkModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    ...cursorFilter,
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate('contentId')
    .lean()
    .exec()) as IBookmarkDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};
