import mongoose from 'mongoose';
import { CreatorModel } from '../creator.model.js';
import type { VideoMilestoneId, CreatorMilestoneId } from '@network/shared';
import { getOrCreate } from './creator.core.repository.js';

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
