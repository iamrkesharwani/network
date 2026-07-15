import { Worker } from 'bullmq';
import {
  TRUST_DECAY_QUEUE_NAME,
  TRUST_DECAY_INACTIVITY_THRESHOLD_MS,
  TRUST_DECAY_POINTS,
} from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../config/bullmq.js';
import { logger } from '../utils/logger.js';
import * as creatorRepository from '../../modules/creator/creator.repository.js';
import { applyTrustDecay } from '../../modules/creator/services/creator.trust.signals.service.js';

export const startTrustDecayWorker = (): Worker => {
  const worker = new Worker(
    TRUST_DECAY_QUEUE_NAME,
    async () => {
      const cutoff = new Date(Date.now() - TRUST_DECAY_INACTIVITY_THRESHOLD_MS);
      const candidateUserIds =
        await creatorRepository.findDecayCandidateUserIds(cutoff);

      let decayedCount = 0;
      for (const userId of candidateUserIds) {
        const mostRecentSignal =
          await creatorRepository.findMostRecentForUser(userId);

        if (mostRecentSignal && mostRecentSignal.createdAt >= cutoff) {
          continue;
        }

        await applyTrustDecay(userId, TRUST_DECAY_POINTS);
        decayedCount += 1;
      }

      if (decayedCount > 0) {
        logger.info(
          `Trust decay: applied to ${decayedCount} inactive creator(s)`
        );
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Trust decay job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Trust decay');

  logger.info('Trust decay worker started');
  return worker;
};
