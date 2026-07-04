import type { PaginatedResponse } from '@network/shared';
import { ShortModel, type IShortDocument } from './short.model.js';
import type { UpdateShortData, WebhookUpdateData } from './short.types.js';
import mongoose from 'mongoose';
import { paginateQuery } from '../../utils/paginate.js';

export const createPlaceholder = (
  userId: string,
  title: string
): Promise<IShortDocument> =>
  ShortModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    title,
  });

export const findById = (id: string): Promise<IShortDocument | null> =>
  ShortModel.findById(id).populate('userId', 'username avatarUrl').exec();

export const findByIdWithStorageKey = (
  id: string
): Promise<IShortDocument | null> =>
  ShortModel.findById(id)
    .select('+storageKey')
    .populate('userId', 'username avatarUrl')
    .exec();

export const findByProviderVideoId = (
  providerVideoId: string
): Promise<IShortDocument | null> =>
  ShortModel.findOne({ providerVideoId }).exec();

export const findPublicFeed = async (
  page: number,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    ShortModel,
    { status: 'READY', visibility: 'public' },
    { createdAt: -1 },
    page,
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
  page: number,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    ShortModel,
    { userId: new mongoose.Types.ObjectId(userId) },
    { createdAt: -1 },
    page,
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
  ShortModel.findByIdAndUpdate(id, data, {
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

export const incrementViews = (id: string): Promise<unknown> =>
  ShortModel.updateOne({ _id: id }, { $inc: { views: 1 } }).exec();

export const deleteById = (id: string): Promise<IShortDocument | null> =>
  ShortModel.findByIdAndDelete(id).select('+storageKey').exec();
