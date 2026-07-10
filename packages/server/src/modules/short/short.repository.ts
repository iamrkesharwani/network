import type { PaginatedResponse } from '@network/shared';
import { ShortModel, type IShortDocument } from './short.model.js';
import type { UpdateShortData, WebhookUpdateData } from './short.types.js';
import mongoose from 'mongoose';
import { paginateQuery } from '../../core/utils/paginate.js';

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

export const findByUserId = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    ShortModel,
    { userId: new mongoose.Types.ObjectId(userId), deletedAt: null },
    cursor,
    limit
  );

  await ShortModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
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
