import { Queue } from 'bullmq';
import {
  ACCOUNT_LIFECYCLE_QUEUE_NAME,
  ACCOUNT_AUTO_REACTIVATE_JOB_NAME,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';

const accountLifecycleQueue = new Queue(ACCOUNT_LIFECYCLE_QUEUE_NAME, {
  connection: bullMqConnection,
});

const autoReactivateJobId = (userId: string): string =>
  `auto-reactivate:${userId}`;

export const scheduleAutoReactivate = async (
  userId: string,
  delayMs: number
): Promise<void> => {
  await accountLifecycleQueue.add(
    ACCOUNT_AUTO_REACTIVATE_JOB_NAME,
    { userId },
    {
      delay: delayMs,
      jobId: autoReactivateJobId(userId),
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
};

export const cancelAutoReactivate = async (userId: string): Promise<void> => {
  const job = await accountLifecycleQueue.getJob(autoReactivateJobId(userId));
  if (job) await job.remove();
};
