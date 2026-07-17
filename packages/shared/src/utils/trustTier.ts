import {
  TRUST_TIERS,
  type TrustTierDefinition,
} from '../modules/creator/creator.constants.js';

export const getTrustTier = (score: number): TrustTierDefinition => {
  const sorted = [...TRUST_TIERS].sort((a, b) => a.minScore - b.minScore);
  return (
    [...sorted].reverse().find((tier) => score >= tier.minScore) ?? sorted[0]!
  );
};

export const getNextTrustTier = (
  score: number
): { tier: TrustTierDefinition; pointsToNext: number } | null => {
  const sorted = [...TRUST_TIERS].sort((a, b) => a.minScore - b.minScore);
  const next = sorted.find((tier) => tier.minScore > score);
  return next ? { tier: next, pointsToNext: next.minScore - score } : null;
};
