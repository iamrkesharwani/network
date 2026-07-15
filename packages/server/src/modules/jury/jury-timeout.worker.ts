import { Worker } from 'bullmq';
import { JURY_TIMEOUT_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import * as juryCaseRepository from './repository/jury-case.repository.js';
import { finalizeTimedOutCase } from './services/jury.consensus.service.js';

const TIMEOUT_SWEEP_BATCH_SIZE = 100;

export const startJuryTimeoutWorker = (): Worker => {
  const worker = new Worker(
    JURY_TIMEOUT_QUEUE_NAME,
    async () => {
      const timedOutCases = await juryCaseRepository.findTimedOutCases(
        new Date(),
        TIMEOUT_SWEEP_BATCH_SIZE
      );

      for (const juryCase of timedOutCases) {
        await finalizeTimedOutCase(juryCase);
      }

      if (timedOutCases.length > 0) {
        logger.info(
          `Jury timeout sweep: resolved ${timedOutCases.length} case(s)`
        );
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Jury timeout sweep job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Jury timeout');

  logger.info('Jury timeout worker started');
  return worker;
};
