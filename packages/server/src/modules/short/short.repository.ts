import type { PaginatedResponse } from '@network/shared';
import { ShortModel, type IShortDocument } from './short.model.js';
import type { UpdateShortData, WebhookUpdateData } from './short.types.js';
import mongoose from 'mongoose';
import { paginateQuery } from '../../core/utils/paginate.js';
import { hybridSearchPaginate } from '../../core/utils/hybridSearchPaginate.js';

export const createPlaceholder = (
  userId: string,
  title: string
): Promise<IShortDocument> =>
  ShortModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    title,
  });

export const findById = (id: string): Promise<IShortDocument | null> =>
  ShortModel.findOne({ _id: id, deletedAt: null })
    .populate('userId', 'username avatarUrl')
    .exec();

export const findByIdWithStorageKey = (
  id: string
): Promise<IShortDocument | null> =>
  ShortModel.findOne({ _id: id, deletedAt: null })
    .select('+storageKey')
    .populate('userId', 'username avatarUrl')
    .exec();

export const findByProviderVideoId = (
  providerVideoId: string
): Promise<IShortDocument | null> =>
  ShortModel.findOne({ providerVideoId }).exec();

export const findPublicFeed = async (
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    ShortModel,
    { status: 'READY', visibility: 'public', deletedAt: null },
    cursor,
    limit
  );

  await ShortModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await hybridSearchPaginate(
    ShortModel,
    q,
    { status: 'READY', visibility: 'public', deletedAt: null },
    cursor,
    limit
  );

  await ShortModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const findByUserId = async (
  userId: string,
  cursor: string | null,
  limit: number,
  extraFilter: Record<string, unknown> = {}
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    ShortModel,
    {
      userId: new mongoose.Types.ObjectId(userId),
      deletedAt: null,
      ...extraFilter,
    },
    cursor,
    limit
  );

  await ShortModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const countByVisibility = async (
  userId: string
): Promise<{ all: number; public: number; unlisted: number }> => {
  const counts = await ShortModel.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        deletedAt: null,
      },
    },
    { $group: { _id: '$visibility', count: { $sum: 1 } } },
  ]);

  const publicCount =
    counts.find((count) => count._id === 'public')?.count ?? 0;
  const unlistedCount =
    counts.find((count) => count._id === 'unlisted')?.count ?? 0;
  return {
    all: publicCount + unlistedCount,
    public: publicCount,
    unlisted: unlistedCount,
  };
};

export const updateById = (
  id: string,
  data: UpdateShortData
): Promise<IShortDocument | null> =>
  ShortModel.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
    returnDocument: 'after',
    runValidators: true,
  })
    .populate('userId', 'username avatarUrl')
    .exec();

export const updateByProviderVideoId = (
  providerVideoId: string,
  data: WebhookUpdateData
): Promise<IShortDocument | null> =>
  ShortModel.findOneAndUpdate({ providerVideoId }, data, {
    returnDocument: 'after',
    runValidators: true,
  })
    .select('+storageKey')
    .exec();

export const incrementViews = (
  id: string
): Promise<{ views: number; userId: mongoose.Types.ObjectId } | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id },
    { $inc: { views: 1 } },
    { returnDocument: 'after', projection: { views: 1, userId: 1 } }
  )
    .lean()
    .exec();

export const softDeleteById = (id: string): Promise<IShortDocument | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { returnDocument: 'after' }
  ).exec();

export const deleteById = (id: string): Promise<IShortDocument | null> =>
  ShortModel.findByIdAndDelete(id).select('+storageKey').exec();
