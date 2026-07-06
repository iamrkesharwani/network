import {
  BADGE_CATALOG,
  CONSISTENT_CREATOR_DISTINCT_DAYS,
  TRUST_POINTS,
  type ICreatorEvent,
} from '@network/shared';
import * as creatorRepository from '../creator.repository.js';
import { evaluateTrustTiers } from './creator.trust.service.js';

export const recordPublish = async (
  userId: string,
  contentType: 'video' | 'short' | 'post'
): Promise<ICreatorEvent> => {
  await creatorRepository.pushActivity(userId, new Date());
  await creatorRepository.incrementTrustScore(userId, TRUST_POINTS.PUBLISH);

  if (contentType === 'video') {
    await creatorRepository.incrementVideoPublishCount(userId);
  } else if (contentType === 'short') {
    await creatorRepository.incrementShortPublishCount(userId);
  } else {
    await creatorRepository.incrementPostPublishCount(userId);
  }

  const newBadgeIds: (keyof typeof BADGE_CATALOG)[] = [];

  const publishCount = await creatorRepository.incrementPublishCount(userId);
  if (publishCount === 1) {
    const unlocked = await creatorRepository.unlockBadge(
      userId,
      'FIRST_UPLOAD'
    );
    if (unlocked) {
      newBadgeIds.push('FIRST_UPLOAD');
      await creatorRepository.incrementTrustScore(
        userId,
        TRUST_POINTS.FIRST_UPLOAD_BADGE
      );
    }
  }

  if (publishCount === 10) {
    const unlocked = await creatorRepository.unlockBadge(
      userId,
      'TENTH_UPLOAD'
    );
    if (unlocked) {
      newBadgeIds.push('TENTH_UPLOAD');
      await creatorRepository.incrementTrustScore(
        userId,
        TRUST_POINTS.TENTH_UPLOAD_BADGE
      );
    }
  }

  const distinctDays =
    await creatorRepository.countDistinctActivityDays(userId);
  if (distinctDays === CONSISTENT_CREATOR_DISTINCT_DAYS) {
    const unlocked = await creatorRepository.unlockBadge(
      userId,
      'CONSISTENT_CREATOR'
    );
    if (unlocked) {
      newBadgeIds.push('CONSISTENT_CREATOR');
      await creatorRepository.incrementTrustScore(
        userId,
        TRUST_POINTS.CONSISTENT_CREATOR_BADGE
      );
    }
  }

  await evaluateTrustTiers(userId);

  return {
    newBadges: newBadgeIds.map((id) => ({
      id,
      unlockedAt: new Date().toISOString(),
      ...BADGE_CATALOG[id],
    })),
    newVideoMilestones: [],
    newCreatorMilestones: [],
  };
};
