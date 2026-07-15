import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '@network/shared';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const prefixSearchPaginate = async <T extends Document>(
  model: Model<T>,
  q: string,
  filter: Record<string, unknown>,
  cursor: string | null | undefined,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<Omit<PaginatedResponse<T>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const prefix = new RegExp('^' + escapeRegExp(q.trim().toLowerCase()));

  const cursorFilter =
    cursor && mongoose.isValidObjectId(cursor)
      ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
      : {};

  const data = (await model
    .find({
      ...filter,
      searchTokens: prefix,
      ...cursorFilter,
    } as mongoose.QueryFilter<T>)
    .sort({ _id: -1 })
    .limit(safeLimit + 1)
    .lean()
    .exec()) as T[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor =
    hasNextPage && lastItem && lastItem._id ? String(lastItem._id) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};
