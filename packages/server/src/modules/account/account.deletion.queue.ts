import { Queue } from 'bullmq';
import {
  ACCOUNT_DELETION_QUEUE_NAME,
  ACCOUNT_DELETE_JOB_NAME,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';

const accountDeletionQueue = new Queue(ACCOUNT_DELETION_QUEUE_NAME, {
  connection: bullMqConnection,
});

const deleteAccountJobId = (userId: string): string =>
  `delete-account:${userId}`;

export const scheduleAccountDeletion = async (
  userId: string,
  delayMs: number
): Promise<void> => {
  await accountDeletionQueue.add(
    ACCOUNT_DELETE_JOB_NAME,
    { userId },
    {
      delay: delayMs,
      jobId: deleteAccountJobId(userId),
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
};

export const cancelAccountDeletion = async (userId: string): Promise<void> => {
  const job = await accountDeletionQueue.getJob(deleteAccountJobId(userId));
  if (job) await job.remove();
};
