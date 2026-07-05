import {
  VIDEO_MILESTONE_LIST,
  CREATOR_MILESTONE_LIST,
  TRUST_POINTS,
} from '@network/shared';
import * as creatorRepository from '../creator.repository.js';
import { evaluateTrustTiers } from './creator.trust.service.js';

export const recordViewIncrement = async (
  userId: string,
  contentId: string,
  newContentViews: number
): Promise<void> => {
  const newTotalViews = await creatorRepository.incrementTotalViews(userId, 1);

  for (const milestone of VIDEO_MILESTONE_LIST) {
    if (newContentViews >= milestone.threshold) {
      const unlocked = await creatorRepository.unlockVideoMilestone(
        userId,
        contentId,
        milestone.id
      );
      if (unlocked) {
        await creatorRepository.incrementTrustScore(
          userId,
          TRUST_POINTS.VIDEO_MILESTONE
        );
      }
    }
  }

  for (const milestone of CREATOR_MILESTONE_LIST) {
    if (newTotalViews >= milestone.threshold) {
      const unlocked = await creatorRepository.unlockCreatorMilestone(
        userId,
        milestone.id
      );
      if (unlocked) {
        await creatorRepository.incrementTrustScore(
          userId,
          TRUST_POINTS.CREATOR_MILESTONE
        );
      }
    }
  }

  await evaluateTrustTiers(userId);
};
