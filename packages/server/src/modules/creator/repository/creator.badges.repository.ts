import mongoose from 'mongoose';
import { CreatorModel, type ICreatorDocument } from '../creator.model.js';
import type { BadgeId } from '@network/shared';
import { getOrCreate } from './creator.core.repository.js';

export const unlockBadge = async (
  userId: string,
  badgeId: BadgeId
): Promise<boolean> => {
  await getOrCreate(userId);
  const result = await CreatorModel.updateOne(
    {
      userId: new mongoose.Types.ObjectId(userId),
      'badges.id': { $ne: badgeId },
    },
    { $push: { badges: { id: badgeId, unlockedAt: new Date() } } }
  ).exec();
  return result.modifiedCount > 0;
};

export const addUnlockedFeatures = (
  userId: string,
  features: string[]
): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $addToSet: { unlockedFeatures: { $each: features } } },
    { returnDocument: 'after', upsert: true }
  ).exec();
