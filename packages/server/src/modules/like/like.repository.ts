import mongoose from 'mongoose';
import type { EngageableContentType } from '@network/shared';
import { LikeModel } from './like.model.js';

interface MongoDuplicateKeyError {
  code?: number;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as MongoDuplicateKeyError).code === 11000;

export const toggle = async (
  userId: string,
  contentType: EngageableContentType,
  contentId: string
): Promise<{ liked: boolean }> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const contentObjectId = new mongoose.Types.ObjectId(contentId);

  const existing = await LikeModel.findOneAndDelete({
    userId: userObjectId,
    contentType,
    contentId: contentObjectId,
  }).exec();

  if (existing) {
    return { liked: false };
  }

  try {
    await LikeModel.create({
      userId: userObjectId,
      contentType,
      contentId: contentObjectId,
    });
    return { liked: true };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { liked: true };
    }
    throw error;
  }
};

export const getUserLikedSet = async (
  userId: string,
  contentType: EngageableContentType,
  contentIds: string[]
): Promise<Set<string>> => {
  const validContentIds = contentIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  const docs = await LikeModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    contentType,
    contentId: {
      $in: validContentIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  })
    .select('contentId')
    .lean()
    .exec();

  return new Set(docs.map((doc) => doc.contentId.toString()));
};
