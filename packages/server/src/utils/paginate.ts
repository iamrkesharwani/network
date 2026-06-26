import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '@network/shared';

export const paginateQuery = async <T extends Document>(
  model: Model<T>,
  filter: mongoose.QueryFilter<T> = {},
  sort: string | { [key: string]: mongoose.SortOrder } = { createdAt: -1 },
  page: number = 1,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<Omit<PaginatedResponse<T>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const skip = (page - 1) * safeLimit;

  const data = (await model
    .find(filter)
    .sort(sort)
    .skip(skip)
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
