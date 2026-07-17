import {
  VIDEO_MILESTONE_LIST,
  CREATOR_VIEW_MILESTONE_LIST,
  CREATOR_EVENT_SOCKET_EVENT,
  type ICreatorEvent,
} from '@network/shared';
import * as creatorRepository from '../creator.repository.js';
import { evaluateTrustTiers } from './creator.trust.service.js';
import { emitToUser } from '../../../core/config/socket.js';

export const recordViewIncrement = async (
  userId: string,
  contentId: string,
  newContentViews: number
): Promise<void> => {
  const newTotalViews = await creatorRepository.incrementTotalViews(userId, 1);
  const unlockedAt = new Date().toISOString();

  const newVideoMilestones: ICreatorEvent['newVideoMilestones'] = [];
  for (const milestone of VIDEO_MILESTONE_LIST) {
    if (newContentViews >= milestone.threshold) {
      const unlocked = await creatorRepository.unlockVideoMilestone(
        userId,
        contentId,
        milestone.id
      );
      if (unlocked) {
        newVideoMilestones.push({
          id: milestone.id,
          label: milestone.label,
          unlockedAt,
        });
        await creatorRepository.incrementTrustScore(
          userId,
          milestone.points
        );
      }
    }
  }

  const newBadges: ICreatorEvent['newBadges'] = [];
  for (const milestone of CREATOR_VIEW_MILESTONE_LIST) {
    if (newTotalViews >= milestone.threshold) {
      const unlocked = await creatorRepository.unlockBadge(
        userId,
        milestone.id
      );
      if (unlocked) {
        newBadges.push({
          id: milestone.id,
          label: milestone.label,
          description: milestone.description,
          unlockedAt,
        });
        await creatorRepository.incrementTrustScore(
          userId,
          milestone.points
        );
      }
    }
  }

  await evaluateTrustTiers(userId);

  if (newVideoMilestones.length > 0 || newBadges.length > 0) {
    const event: ICreatorEvent = { newBadges, newVideoMilestones };
    emitToUser(userId, CREATOR_EVENT_SOCKET_EVENT, event);
  }
};
