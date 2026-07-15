import type {
  ModerationStatus,
  PaginatedResponse,
  VideoCategory,
} from '@network/shared';
import { RELATED_SCORE_WEIGHTS, ONE_DAY_MS } from '@network/shared';
import { VideoModel, type IVideoDocument } from './video.model.js';
import type {
  UpdateVideoData,
  WebhookUpdateData,
  NewCaptionData,
} from './video.types.js';
import mongoose from 'mongoose';
import { paginateQuery } from '../../core/utils/paginate.js';
import { hybridSearchPaginate } from '../../core/utils/hybridSearchPaginate.js';

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
  VideoModel.findOne({ _id: id, deletedAt: null }).select('+storageKey').exec();

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
    {
      status: 'READY',
      visibility: 'public',
      deletedAt: null,
      moderationStatus: 'active',
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

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IVideoDocument>, 'success' | 'message'>> => {
  const result = await hybridSearchPaginate(
    VideoModel,
    q,
    {
      status: 'READY',
      visibility: 'public',
      deletedAt: null,
      moderationStatus: 'active',
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

export const findRelated = async (
  excludeVideoId: string,
  category: VideoCategory,
  tags: string[],
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IVideoDocument>, 'success' | 'message'>> => {
  const excludeObjectId = new mongoose.Types.ObjectId(excludeVideoId);
  const baseMatch: mongoose.QueryFilter<IVideoDocument> = {
    status: 'READY',
    visibility: 'public',
    deletedAt: null,
    moderationStatus: 'active',
    _id: { $ne: excludeObjectId },
  };

  if (cursor) {
    const result = await paginateQuery(VideoModel, baseMatch, cursor, limit);

    await VideoModel.populate(result.data, {
      path: 'userId',
      select: 'username avatarUrl',
    });

    return result;
  }

  const scored = await VideoModel.aggregate<IVideoDocument>([
    { $match: baseMatch },
    {
      $addFields: {
        _relevanceScore: {
          $add: [
            {
              $cond: [
                { $eq: ['$category', category] },
                RELATED_SCORE_WEIGHTS.categoryMatch,
                0,
              ],
            },
            {
              $multiply: [
                { $size: { $setIntersection: ['$tags', tags] } },
                RELATED_SCORE_WEIGHTS.tagOverlap,
              ],
            },
            {
              $divide: [
                RELATED_SCORE_WEIGHTS.recency,
                {
                  $add: [
                    1,
                    {
                      $divide: [
                        { $subtract: ['$$NOW', '$createdAt'] },
                        ONE_DAY_MS,
                      ],
                    },
                  ],
                },
              ],
            },
            {
              $multiply: [
                { $ln: { $add: ['$views', 1] } },
                RELATED_SCORE_WEIGHTS.views,
              ],
            },
            {
              $multiply: [
                { $ln: { $add: ['$likes', 1] } },
                RELATED_SCORE_WEIGHTS.likes,
              ],
            },
          ],
        },
      },
    },
    { $sort: { _relevanceScore: -1, _id: -1 } },
    { $limit: limit },
    { $project: { _relevanceScore: 0 } },
  ]);

  let combined = scored;

  if (combined.length < limit) {
    const alreadySelected = combined.map((doc) => doc._id);
    const backfill = (await VideoModel.find({
      ...baseMatch,
      _id: { $nin: [...alreadySelected, excludeObjectId] },
    })
      .sort({ _id: -1 })
      .limit(limit - combined.length)
      .lean()
      .exec()) as IVideoDocument[];

    combined = [...combined, ...backfill];
  }

  await VideoModel.populate(combined, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  const lastItem = combined[combined.length - 1];

  return {
    data: combined,
    meta: {
      nextCursor: lastItem ? String(lastItem._id) : null,
      hasNextPage: combined.length >= limit,
      limit,
    },
  };
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

export const setModerationStatus = async (
  id: string,
  status: ModerationStatus
): Promise<void> => {
  await VideoModel.updateOne({ _id: id }, { $set: { moderationStatus: status } }).exec();
};

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
