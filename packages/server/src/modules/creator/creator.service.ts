import {
  BADGE_CATALOG,
  VIDEO_MILESTONE_LIST,
  CREATOR_MILESTONE_LIST,
  TRUST_POINTS,
  TRUST_TIERS,
  CONSISTENT_CREATOR_DISTINCT_DAYS,
  type ICreatorEvent,
  type ICreatorProfile,
} from '@network/shared';
import * as creatorRepository from './creator.repository.js';

export const recordPublish = async (
  userId: string,
  contentType: 'video' | 'short'
): Promise<ICreatorEvent> => {
  await creatorRepository.pushActivity(userId, new Date());
  await creatorRepository.incrementTrustScore(userId, TRUST_POINTS.PUBLISH);

  if (contentType === 'video') {
    await creatorRepository.incrementVideoPublishCount(userId);
  } else {
    await creatorRepository.incrementShortPublishCount(userId);
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

export const evaluateTrustTiers = async (userId: string): Promise<void> => {
  const doc = await creatorRepository.findByUserId(userId);
  const score = doc?.trustScore ?? 0;

  const unlocksToAdd = TRUST_TIERS.filter(
    (tier) => score >= tier.minScore
  ).flatMap((tier) => tier.unlocks);

  if (unlocksToAdd.length > 0) {
    await creatorRepository.addUnlockedFeatures(userId, unlocksToAdd);
  }
};

export const getProfile = async (userId: string): Promise<ICreatorProfile> => {
  const doc = await creatorRepository.getOrCreate(userId);
  return {
    badges: doc.badges.map((b) => ({
      id: b.id,
      unlockedAt: b.unlockedAt.toISOString(),
    })),
    videoMilestones: doc.videoMilestones.map((m) => ({
      videoId: m.videoId.toString(),
      id: m.id,
      unlockedAt: m.unlockedAt.toISOString(),
    })),
    creatorMilestones: doc.creatorMilestones.map((m) => ({
      id: m.id,
      unlockedAt: m.unlockedAt.toISOString(),
    })),
    unlockedFeatures: doc.unlockedFeatures,
    uploadActivity: doc.uploadActivity.map((d) => d.toISOString()),
    videoPublishCount: doc.videoPublishCount,
    shortPublishCount: doc.shortPublishCount,
  };
};
