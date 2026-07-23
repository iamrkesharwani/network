import { Queue } from 'bullmq';
import {
  MESSAGE_EXPIRY_QUEUE_NAME,
  MESSAGE_EXPIRE_JOB_NAME,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';

const messageExpiryQueue = new Queue(MESSAGE_EXPIRY_QUEUE_NAME, {
  connection: bullMqConnection,
});

const expireMessageJobId = (messageId: string): string =>
  `expire-message:${messageId}`;

export const scheduleMessageExpiry = async (
  messageId: string,
  delayMs: number
): Promise<void> => {
  await messageExpiryQueue.add(
    MESSAGE_EXPIRE_JOB_NAME,
    { messageId },
    {
      delay: delayMs,
      jobId: expireMessageJobId(messageId),
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
};

export const cancelMessageExpiry = async (messageId: string): Promise<void> => {
  const job = await messageExpiryQueue.getJob(expireMessageJobId(messageId));
  if (job) await job.remove();
};
