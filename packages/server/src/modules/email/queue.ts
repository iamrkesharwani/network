import { Queue } from 'bullmq';
import { EMAIL_QUEUE_NAME } from '@network/shared';
import { logger } from '../../core/utils/logger.js';
import { bullMqConnection } from './connection.js';
import type {
  EmailJobData,
  GenericEmailJob,
  OtpEmailJob,
  PasswordResetEmailJob,
} from './types.js';

const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

const enqueue = async (data: EmailJobData): Promise<void> => {
  try {
    await emailQueue.add(data.type as string & EmailJobData['type'], data);
    logger.info(`Email job enqueued: type=${data.type} to=${data.to}`);
  } catch (error) {
    logger.error(
      error,
      `Failed to enqueue email job: type=${data.type} to=${data.to}`
    );
    throw error;
  }
};

export const queueOtpEmail = (
  payload: Omit<OtpEmailJob, 'type'>
): Promise<void> => enqueue({ type: 'otp', ...payload });

export const queuePasswordResetEmail = (
  payload: Omit<PasswordResetEmailJob, 'type'>
): Promise<void> => enqueue({ type: 'password-reset', ...payload });

export const queueGenericEmail = (
  payload: Omit<GenericEmailJob, 'type'>
): Promise<void> => enqueue({ type: 'generic', ...payload });
