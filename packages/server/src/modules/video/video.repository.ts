import type { PaginatedResponse } from '@network/shared';
import { VideoModel, type IVideoDocument } from './video.model.js';
import type { UpdateVideoData, WebhookUpdateData } from './video.types.js';
import mongoose from 'mongoose';
import { paginateQuery } from '../../core/utils/paginate.js';

export const createPlaceholder = (
  userId: string,
  title: string
): Promise<IVideoDocument> =>
  VideoModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    title,
  });

export const findById = (id: string): Promise<IVideoDocument | null> =>
  VideoModel.findOne({ _id: id, deletedAt: null })
    .populate('userId', 'username avatarUrl')
    .exec();

export const findByIdWithStorageKey = (
  id: string
): Promise<IVideoDocument | null> =>
  VideoModel.findOne({ _id: id, deletedAt: null })
    .select('+storageKey')
    .exec();

export const findByProviderVideoId = (
  providerVideoId: string
): Promise<IVideoDocument | null> =>
  VideoModel.findOne({ providerVideoId }).exec();

export const findPublicFeed = async (
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IVideoDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    VideoModel,
    { status: 'READY', visibility: 'public', deletedAt: null },
    cursor,
    limit
  );

  await VideoModel.populate(result.data, {
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
): Promise<Omit<PaginatedResponse<IVideoDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    VideoModel,
    {
      userId: new mongoose.Types.ObjectId(userId),
      deletedAt: null,
      ...extraFilter,
    },
    cursor,
    limit
  );

  await VideoModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const updateById = (
  id: string,
  data: UpdateVideoData
): Promise<IVideoDocument | null> =>
  VideoModel.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
    returnDocument: 'after',
    runValidators: true,
  })
    .populate('userId', 'username avatarUrl')
    .exec();

export const updateByProviderVideoId = (
  providerVideoId: string,
  data: WebhookUpdateData
): Promise<IVideoDocument | null> =>
  VideoModel.findOneAndUpdate({ providerVideoId }, data, {
    returnDocument: 'after',
    runValidators: true,
  }).exec();

export const incrementViews = (
  id: string
): Promise<{ views: number; userId: mongoose.Types.ObjectId } | null> =>
  VideoModel.findOneAndUpdate(
    { _id: id },
    { $inc: { views: 1 } },
    { returnDocument: 'after', projection: { views: 1, userId: 1 } }
  )
    .lean()
    .exec();

export const softDeleteById = (id: string): Promise<IVideoDocument | null> =>
  VideoModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { returnDocument: 'after' }
  ).exec();

export const deleteById = (id: string): Promise<IVideoDocument | null> =>
  VideoModel.findByIdAndDelete(id).select('+storageKey').exec();
