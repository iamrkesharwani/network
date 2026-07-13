import type { PaginatedResponse } from '@network/shared';
import { VideoModel, type IVideoDocument } from './video.model.js';
import type {
  UpdateVideoData,
  WebhookUpdateData,
  NewCaptionData,
} from './video.types.js';
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

export const countByVisibility = async (
  userId: string
): Promise<{ all: number; public: number; unlisted: number }> => {
  const counts = await VideoModel.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        deletedAt: null,
      },
    },
    { $group: { _id: '$visibility', count: { $sum: 1 } } },
  ]);

  const publicCount = counts.find((count) => count._id === 'public')?.count ?? 0;
  const unlistedCount = counts.find((count) => count._id === 'unlisted')?.count ?? 0;
  return {
    all: publicCount + unlistedCount,
    public: publicCount,
    unlisted: unlistedCount,
  };
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

export const findByIdWithCaptionStorageKeys = (
  id: string
): Promise<IVideoDocument | null> =>
  VideoModel.findOne({ _id: id, deletedAt: null })
    .select('+captions.storageKey')
    .exec();

export const pushCaption = (
  videoId: string,
  caption: NewCaptionData
): Promise<IVideoDocument | null> =>
  VideoModel.findOneAndUpdate(
    { _id: videoId, deletedAt: null },
    { $push: { captions: caption } },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('userId', 'username avatarUrl')
    .exec();

export const pullCaption = (
  videoId: string,
  captionId: string
): Promise<IVideoDocument | null> =>
  VideoModel.findOneAndUpdate(
    { _id: videoId, deletedAt: null },
    { $pull: { captions: { _id: captionId } } },
    { returnDocument: 'after' }
  )
    .populate('userId', 'username avatarUrl')
    .exec();

export const clearCaptionDefaults = async (videoId: string): Promise<void> => {
  await VideoModel.updateOne(
    { _id: videoId, deletedAt: null },
    { $set: { 'captions.$[].isDefault': false } }
  ).exec();
};

export const setCaptionDefault = (
  videoId: string,
  captionId: string
): Promise<IVideoDocument | null> => {
  const captionObjectId = new mongoose.Types.ObjectId(captionId);

  return VideoModel.findOneAndUpdate(
    { _id: videoId, deletedAt: null },
    {
      $set: {
        'captions.$[target].isDefault': true,
        'captions.$[others].isDefault': false,
      },
    },
    {
      arrayFilters: [
        { 'target._id': captionObjectId },
        { 'others._id': { $ne: captionObjectId } },
      ],
      returnDocument: 'after',
    }
  )
    .populate('userId', 'username avatarUrl')
    .exec();
};
