import mongoose from 'mongoose';
import {
  GamificationModel,
  type IGamificationDocument,
} from './gamification.model.js';
import type { AchievementId } from '@network/shared';

export const getOrCreate = (userId: string): Promise<IGamificationDocument> =>
  GamificationModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $setOnInsert: { xp: 0, uploadsCount: 0, achievements: [] } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const findByUserId = (
  userId: string
): Promise<IGamificationDocument | null> =>
  GamificationModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).exec();

export const addXp = (
  userId: string,
  amount: number
): Promise<IGamificationDocument> =>
  GamificationModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { xp: amount } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const incrementUploadsCount = (userId: string): Promise<number> =>
  GamificationModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { uploadsCount: 1 } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.uploadsCount);

export const unlockAchievement = async (
  userId: string,
  achievementId: AchievementId
): Promise<boolean> => {
  await getOrCreate(userId);

  const result = await GamificationModel.updateOne(
    {
      userId: new mongoose.Types.ObjectId(userId),
      'achievements.id': { $ne: achievementId },
    },
    {
      $push: {
        achievements: { id: achievementId, unlockedAt: new Date() },
      },
    }
  ).exec();

  return result.modifiedCount > 0;
};
