import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '@network/shared';

// Keyset (cursor) pagination, not skip/limit: offset pagination is O(n) in
// Mongo because it has to walk and discard `skip` documents on every page,
// which falls over once a feed has more than a few thousand items. ObjectId
// already encodes a monotonically increasing creation order (timestamp +
// counter), so it doubles as a stable, collision-free cursor without needing
// a separate tie-breaker field alongside `createdAt`.
export const paginateQuery = async <T extends Document>(
  model: Model<T>,
  filter: mongoose.QueryFilter<T> = {},
  cursor: string | null | undefined = null,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<Omit<PaginatedResponse<T>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);

  const cursorFilter =
    cursor && mongoose.isValidObjectId(cursor)
      ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
      : {};

  const data = (await model
    .find({ ...filter, ...cursorFilter } as mongoose.QueryFilter<T>)
    .sort({ _id: -1 })
    .limit(safeLimit + 1)
    .lean()
    .exec()) as T[];

  const hasNextPage = data.length > safeLimit;

  if (hasNextPage) {
    data.pop();
  }

  const lastItem = data[data.length - 1];
  const nextCursor =
    hasNextPage && lastItem && lastItem._id ? String(lastItem._id) : null;

  return {
    data,
    meta: {
      nextCursor,
      hasNextPage,
      limit: safeLimit,
    },
  };
};
