import { Worker } from 'bullmq';
import { ACCOUNT_LIFECYCLE_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { User } from '../user/user.model.js';

export const startAccountLifecycleWorker = (): Worker => {
  const worker = new Worker(
    ACCOUNT_LIFECYCLE_QUEUE_NAME,
    async (job) => {
      const { userId } = job.data as { userId: string };

      const user = await User.findById(userId).exec();
      if (!user || user.status !== 'deactivated') return;

      user.status = 'active';
      user.deactivatedAt = null;
      user.reactivateAt = null;
      await user.save();

      logger.info({ userId }, 'Account auto-reactivated after deactivation window elapsed');
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Account lifecycle job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Account lifecycle');

  logger.info('Account lifecycle worker started');
  return worker;
};
