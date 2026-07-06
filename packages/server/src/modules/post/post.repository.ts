import mongoose from 'mongoose';
import { PostModel, type IPostDocument } from './post.model.js';

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
