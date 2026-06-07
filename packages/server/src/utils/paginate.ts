import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import type { PaginatedResponse } from '@network/shared';

export const paginateQuery = async <T extends Document>(
  model: Model<T>,
  filter: mongoose.QueryFilter<T> = {},
  sort: string | { [key: string]: mongoose.SortOrder } = { createdAt: -1 },
  page: number = 1,
  limit: number = 20
): Promise<Omit<PaginatedResponse<T>, 'success' | 'message'>> => {
  const skip = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<T[]>,
    model.countDocuments(filter).exec(),
  ]);

  const hasNextPage = skip + data.length < totalCount;
  const lastItem = data[data.length - 1];
  const nextCursor =
    hasNextPage && lastItem && lastItem._id ? String(lastItem._id) : null;

  return {
    data,
    meta: {
      nextCursor,
      hasNextPage,
      limit,
    },
  };
};
