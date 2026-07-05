import { TRUST_TIERS } from '@network/shared';
import * as creatorRepository from '../creator.repository.js';

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
