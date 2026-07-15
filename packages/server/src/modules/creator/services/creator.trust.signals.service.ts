import {
  TRUST_POINTS,
  TRUST_SIGNAL_WINDOW_MS,
  TRUST_SIGNAL_DIMINISHING_MULTIPLIERS,
  TRUST_SIGNAL_DIMINISHING_FLOOR,
  type TrustSignalType,
} from '@network/shared';
import * as creatorCoreRepository from '../repository/creator.core.repository.js';
import * as creatorStatsRepository from '../repository/creator.stats.repository.js';
import * as trustSignalLogRepository from '../repository/creator.trust-signal-log.repository.js';
import { evaluateTrustTiers } from './creator.trust.service.js';

const multiplierForOccurrence = (occurrenceIndex: number): number =>
  TRUST_SIGNAL_DIMINISHING_MULTIPLIERS[occurrenceIndex] ??
  TRUST_SIGNAL_DIMINISHING_FLOOR;

export const applyTrustSignal = async (
  userId: string,
  signalType: TrustSignalType
): Promise<void> => {
  await creatorCoreRepository.getOrCreate(userId);

  const rawWeight = TRUST_POINTS[signalType];
  const windowStart = new Date(Date.now() - TRUST_SIGNAL_WINDOW_MS);

  let multiplier = 1;
  if (rawWeight > 0) {
    const occurrences = await trustSignalLogRepository.countRecentSignals(
      userId,
      signalType,
      windowStart
    );
    multiplier = multiplierForOccurrence(occurrences);
  }

  const appliedPoints = Math.round(rawWeight * multiplier);

  await creatorStatsRepository.incrementTrustScore(userId, appliedPoints);
  await trustSignalLogRepository.create(
    userId,
    signalType,
    rawWeight,
    multiplier,
    appliedPoints
  );

  await evaluateTrustTiers(userId);
};

export const applyTrustDecay = async (
  userId: string,
  points: number
): Promise<void> => {
  await creatorStatsRepository.incrementTrustScore(userId, -Math.abs(points));
  await trustSignalLogRepository.create(
    userId,
    'DECAY',
    -Math.abs(points),
    1,
    -Math.abs(points)
  );
  await evaluateTrustTiers(userId);
};
