import mongoose from 'mongoose';
import { PostModel, type IPostDocument } from './post.model.js';
import type {
  ModerationStatus,
  PaginatedResponse,
  PostVisibility,
} from '@network/shared';
import { paginateQuery } from '../../core/utils/paginate.js';
import { hybridSearchPaginate } from '../../core/utils/hybridSearchPaginate.js';
import type { UpdatePostData } from './post.types.js';

export const createTextOrImagePost = async (
  userId: string,
  data: {
    text?: string;
    imageUrls?: string[];
    mediaType: 'none' | 'image';
    tags: string[];
    visibility: PostVisibility;
    unlistedAt?: Date | null;
    unlistedExpiryWarnedAt?: Date | null;
  }
): Promise<IPostDocument> => {
  const post = await PostModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    ...(data.text !== undefined && { text: data.text }),
    ...(data.imageUrls !== undefined && { imageUrls: data.imageUrls }),
    mediaType: data.mediaType,
    tags: data.tags,
    visibility: data.visibility,
    ...(data.unlistedAt !== undefined && { unlistedAt: data.unlistedAt }),
    ...(data.unlistedExpiryWarnedAt !== undefined && {
      unlistedExpiryWarnedAt: data.unlistedExpiryWarnedAt,
    }),
    status: 'READY',
  });
  return post.populate('userId', 'username avatarUrl');
};

export const findById = (id: string): Promise<IPostDocument | null> => {
  return PostModel.findOne({ _id: id, deletedAt: null })
    .populate('userId', 'username avatarUrl')
    .exec();
};

export const findPublicFeed = async (
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IPostDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    PostModel,
    {
      status: 'READY',
      visibility: 'public',
      deletedAt: null,
      moderationStatus: 'active',
    },
    cursor,
    limit
  );

  await PostModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IPostDocument>, 'success' | 'message'>> => {
  const result = await hybridSearchPaginate(
    PostModel,
    q,
    { status: 'READY', visibility: 'public', deletedAt: null },
    cursor,
    limit
  );

  await PostModel.populate(result.data, {
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
): Promise<Omit<PaginatedResponse<IPostDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    PostModel,
    {
      userId: new mongoose.Types.ObjectId(userId),
      deletedAt: null,
      ...extraFilter,
    },
    cursor,
    limit
  );

  await PostModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const countByVisibility = async (
  userId: string
): Promise<{ all: number; public: number; unlisted: number }> => {
  const counts = await PostModel.aggregate<{ _id: string; count: number }>([
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
  data: UpdatePostData
): Promise<IPostDocument | null> => {
  return PostModel.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
    returnDocument: 'after',
    runValidators: true,
  })
    .populate('userId', 'username avatarUrl')
    .exec();
};

export const incrementViews = (
  id: string
): Promise<{ views: number; userId: mongoose.Types.ObjectId } | null> => {
  return PostModel.findOneAndUpdate(
    { _id: id },
    { $inc: { views: 1 } },
    { returnDocument: 'after', projection: { views: 1, userId: 1 } }
  )
    .lean()
    .exec();
};

export const softDeleteById = (id: string): Promise<IPostDocument | null> => {
  return PostModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { returnDocument: 'after' }
  ).exec();
};

export const deleteById = (id: string): Promise<IPostDocument | null> => {
  return PostModel.findByIdAndDelete(id).select('+storageKey').exec();
};

export const setModerationStatus = async (
  id: string,
  status: ModerationStatus
): Promise<void> => {
  await PostModel.updateOne({ _id: id }, { $set: { moderationStatus: status } }).exec();
};
