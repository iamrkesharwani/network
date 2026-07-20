import type { ModerationStatus, PaginatedResponse } from '@network/shared';
import { RELATED_SCORE_WEIGHTS, ONE_DAY_MS } from '@network/shared';
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
    {
      status: 'READY',
      visibility: 'public',
      deletedAt: null,
      moderationStatus: { $nin: ['jury_removed', 'admin_removed'] },
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

export const findByIds = (ids: string[]): Promise<IShortDocument[]> =>
  ShortModel.find({
    _id: { $in: ids },
    status: 'READY',
    visibility: 'public',
    deletedAt: null,
    moderationStatus: { $nin: ['jury_removed', 'admin_removed'] },
  })
    .populate('userId', 'username avatarUrl')
    .exec();

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const result = await hybridSearchPaginate(
    ShortModel,
    q,
    {
      status: 'READY',
      visibility: 'public',
      deletedAt: null,
      moderationStatus: { $nin: ['jury_removed', 'admin_removed'] },
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

export const findRelated = async (
  tags: string[],
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IShortDocument>, 'success' | 'message'>> => {
  const baseMatch: mongoose.QueryFilter<IShortDocument> = {
    status: 'READY',
    visibility: 'public',
    deletedAt: null,
    moderationStatus: { $nin: ['jury_removed', 'admin_removed'] },
  };

  if (cursor) {
    const result = await paginateQuery(ShortModel, baseMatch, cursor, limit);

    await ShortModel.populate(result.data, {
      path: 'userId',
      select: 'username avatarUrl',
    });

    return result;
  }

  const scored = await ShortModel.aggregate<IShortDocument>([
    { $match: baseMatch },
    {
      $addFields: {
        _relevanceScore: {
          $add: [
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
    const backfill = (await ShortModel.find({
      ...baseMatch,
      _id: { $nin: alreadySelected },
    })
      .sort({ _id: -1 })
      .limit(limit - combined.length)
      .lean()
      .exec()) as IShortDocument[];

    combined = [...combined, ...backfill];
  }

  await ShortModel.populate(combined, {
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

export const incrementLikes = (
  id: string
): Promise<{ likes: number } | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { likes: { $add: ['$likes', 1] } } }],
    { returnDocument: 'after', updatePipeline: true, projection: { likes: 1 } }
  )
    .lean()
    .exec();

export const decrementLikes = (
  id: string
): Promise<{ likes: number } | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { likes: { $max: [{ $add: ['$likes', -1] }, 0] } } }],
    { returnDocument: 'after', updatePipeline: true, projection: { likes: 1 } }
  )
    .lean()
    .exec();

export const incrementCommentsCount = (
  id: string
): Promise<{ commentsCount: number } | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { commentsCount: { $add: ['$commentsCount', 1] } } }],
    {
      returnDocument: 'after',
      updatePipeline: true,
      projection: { commentsCount: 1 },
    }
  )
    .lean()
    .exec();

export const decrementCommentsCount = (
  id: string
): Promise<{ commentsCount: number } | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          commentsCount: { $max: [{ $add: ['$commentsCount', -1] }, 0] },
        },
      },
    ],
    {
      returnDocument: 'after',
      updatePipeline: true,
      projection: { commentsCount: 1 },
    }
  )
    .lean()
    .exec();

export const incrementShares = (
  id: string
): Promise<{ shares: number } | null> =>
  ShortModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { shares: { $add: ['$shares', 1] } } }],
    {
      returnDocument: 'after',
      updatePipeline: true,
      projection: { shares: 1 },
    }
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

export const setModerationStatus = async (
  id: string,
  status: ModerationStatus
): Promise<void> => {
  await ShortModel.updateOne({ _id: id }, { $set: { moderationStatus: status } }).exec();
};
