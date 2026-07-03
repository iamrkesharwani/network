import mongoose from 'mongoose';
import { CreatorModel, type ICreatorDocument } from './creator.model.js';
import type {
  BadgeId,
  VideoMilestoneId,
  CreatorMilestoneId,
} from '@network/shared';

export const getOrCreate = (userId: string): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId) } },
    { returnDocument: 'after', upsert: true }
  ).exec();

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

export const unlockVideoMilestone = async (
  userId: string,
  videoId: string,
  milestoneId: VideoMilestoneId
): Promise<boolean> => {
  await getOrCreate(userId);
  const result = await CreatorModel.updateOne(
    {
      userId: new mongoose.Types.ObjectId(userId),
      videoMilestones: {
        $not: {
          $elemMatch: {
            videoId: new mongoose.Types.ObjectId(videoId),
            id: milestoneId,
          },
        },
      },
    },
    {
      $push: {
        videoMilestones: {
          videoId: new mongoose.Types.ObjectId(videoId),
          id: milestoneId,
          unlockedAt: new Date(),
        },
      },
    }
  ).exec();
  return result.modifiedCount > 0;
};

export const unlockCreatorMilestone = async (
  userId: string,
  milestoneId: CreatorMilestoneId
): Promise<boolean> => {
  await getOrCreate(userId);
  const result = await CreatorModel.updateOne(
    {
      userId: new mongoose.Types.ObjectId(userId),
      'creatorMilestones.id': { $ne: milestoneId },
    },
    {
      $push: {
        creatorMilestones: { id: milestoneId, unlockedAt: new Date() },
      },
    }
  ).exec();
  return result.modifiedCount > 0;
};

export const incrementTrustScore = (
  userId: string,
  amount: number
): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { trustScore: amount } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const incrementTotalViews = (
  userId: string,
  amount: number
): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { totalViews: amount } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.totalViews);

export const incrementPublishCount = (userId: string): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { publishCount: 1 } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.publishCount);

export const pushActivity = (
  userId: string,
  date: Date
): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $push: { uploadActivity: date } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const countDistinctActivityDays = async (
  userId: string
): Promise<number> => {
  const doc = await getOrCreate(userId);
  const days = new Set(
    doc.uploadActivity.map((d) => d.toISOString().slice(0, 10)) // YYYY-MM-DD
  );
  return days.size;
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

export const findByUserId = (
  userId: string
): Promise<ICreatorDocument | null> =>
  CreatorModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
