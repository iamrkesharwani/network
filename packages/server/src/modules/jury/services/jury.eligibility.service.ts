import {
  TRUST_TIERS,
  SENIOR_JUROR_MIN_SCORE,
  JUROR_COOLDOWN_MS,
} from '@network/shared';
import * as creatorRepository from '../../creator/creator.repository.js';
import * as juryAssignmentRepository from '../repository/jury-assignment.repository.js';

const VETERAN_MIN_SCORE =
  TRUST_TIERS.find((tier) => tier.id === 'VETERAN')?.minScore ?? 400;

export const isJuryEligible = async (userId: string): Promise<boolean> => {
  const creator = await creatorRepository.findByUserId(userId);
  return (creator?.trustScore ?? 0) >= VETERAN_MIN_SCORE;
};

export const isSeniorJurorEligible = async (
  userId: string
): Promise<boolean> => {
  const creator = await creatorRepository.findByUserId(userId);
  return (creator?.trustScore ?? 0) >= SENIOR_JUROR_MIN_SCORE;
};

export const selectJuryPool = async (
  poolSize: number,
  excludeUserIds: string[],
  options?: { seniorOnly?: boolean }
): Promise<string[]> => {
  const minScore = options?.seniorOnly
    ? SENIOR_JUROR_MIN_SCORE
    : VETERAN_MIN_SCORE;

  const cooldownStart = new Date(Date.now() - JUROR_COOLDOWN_MS);
  const onCooldown =
    await juryAssignmentRepository.findJurorIdsVotedSince(cooldownStart);

  return creatorRepository.findRandomEligibleJurorUserIds(
    minScore,
    [...new Set([...excludeUserIds, ...onCooldown])],
    poolSize
  );
};
