import { Worker } from 'bullmq';
import { ACCOUNT_DELETION_QUEUE_NAME } from '@network/shared';
import {
  attachWorkerErrorBackoff,
  bullMqConnection,
} from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { User } from '../user/user.model.js';
import { getAccountDeletionAdapters } from './account.deletion.registry.js';

export const startAccountDeletionWorker = (): Worker => {
  const worker = new Worker(
    ACCOUNT_DELETION_QUEUE_NAME,
    async (job) => {
      const { userId } = job.data as { userId: string };

      const user = await User.findById(userId).exec();
      if (!user || user.status !== 'pending_deletion') return;

      for (const adapter of getAccountDeletionAdapters()) {
        const deleted = await adapter.deleteAllForUser(userId);
        logger.info(
          { userId, contentType: adapter.contentType, deleted },
          'Account deletion: content removed'
        );
      }

      await User.deleteOne({ _id: userId }).exec();

      logger.info(
        { userId },
        'Account permanently deleted after grace period elapsed'
      );
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Account deletion job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Account deletion');

  logger.info('Account deletion worker started');
  return worker;
};
