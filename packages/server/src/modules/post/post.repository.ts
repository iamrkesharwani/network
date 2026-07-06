import mongoose from 'mongoose';
import { PostModel, type IPostDocument } from './post.model.js';
import type { PaginatedResponse } from '@network/shared';
import { paginateQuery } from '../../utils/paginate.js';
import type { UpdatePostData, WebhookUpdateData } from './post.types.js';

export const createTextOrImagePost = (
  userId: string,
  data: {
    text?: string;
    imageUrl?: string;
    mediaType: 'none' | 'image';
    tags: string[];
    visibility: 'public' | 'private' | 'unlisted';
  }
): Promise<IPostDocument> => {
  return PostModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    ...(data.text !== undefined && { text: data.text }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    mediaType: data.mediaType,
    tags: data.tags,
    visibility: data.visibility,
    status: 'READY',
  });
};

export const createVideoPlaceholder = (
  userId: string,
  text?: string
): Promise<IPostDocument> => {
  return PostModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    ...(text !== undefined && { text }),
    mediaType: 'video',
  });
};

export const findById = (id: string): Promise<IPostDocument | null> => {
  return PostModel.findById(id).populate('userId', 'username avatarUrl').exec();
};

export const findIdWithStorageKey = (
  id: string
): Promise<IPostDocument | null> => {
  return PostModel.findById(id)
    .select('+storageKey')
    .populate('userId', 'username avatarUrl')
    .exec();
};

export const findByProviderVideoId = (
  providerVideoId: string
): Promise<IPostDocument | null> => {
  return PostModel.findOne({ providerVideoId }).exec();
};

export const findPublicFeed = async (
  page: number,
  limit: number
): Promise<Omit<PaginatedResponse<IPostDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    PostModel,
    { status: 'READY', visibility: 'public' },
    { createdAt: -1 },
    page,
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
  page: number,
  limit: number
): Promise<Omit<PaginatedResponse<IPostDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    PostModel,
    { userId: new mongoose.Types.ObjectId(userId) },
    { createdAt: -1 },
    page,
    limit
  );

  await PostModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const updateById = (
  id: string,
  data: UpdatePostData
): Promise<IPostDocument | null> => {
  return PostModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  })
    .populate('userId', 'username avatarUrl')
    .exec();
};

export const updateByProviderVideoId = (
  providerVideoId: string,
  data: WebhookUpdateData
): Promise<IPostDocument | null> => {
  return PostModel.findOneAndUpdate({ providerVideoId }, data, {
    returnDocument: 'after',
    runValidators: true,
  })
    .select('+storageKey')
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

export const deleteById = (id: string): Promise<IPostDocument | null> => {
  return PostModel.findByIdAndDelete(id).select('+storageKey').exec();
};
