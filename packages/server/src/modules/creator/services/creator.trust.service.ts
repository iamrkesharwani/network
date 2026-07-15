import { TRUST_TIERS } from '@network/shared';
import * as creatorRepository from '../creator.repository.js';

export const evaluateTrustTiers = async (userId: string): Promise<void> => {
  const doc = await creatorRepository.findByUserId(userId);
  const score = doc?.trustScore ?? 0;

  const unlocks = TRUST_TIERS.filter((tier) => score >= tier.minScore).flatMap(
    (tier) => tier.unlocks
  );

  await creatorRepository.setUnlockedFeatures(userId, unlocks);
};
