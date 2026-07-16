import { getTrustTier, getNextTrustTier } from '@network/shared';
import type { ICreatorProfile, TrustFeatureId } from '@network/shared';
import * as creatorRepository from '../creator.repository.js';

export const getProfile = async (userId: string): Promise<ICreatorProfile> => {
  const doc = await creatorRepository.getOrCreate(userId);
  const score = doc.trustScore;
  const tier = getTrustTier(score);
  const next = getNextTrustTier(score);

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

    postPublishCount: doc.postPublishCount,

    trust: {
      score,
      tier: tier.id,
      unlockedFeatures: doc.unlockedFeatures as TrustFeatureId[],
      nextTier: next
        ? { id: next.tier.id, pointsToNext: next.pointsToNext }
        : null,
    },
  };
};
