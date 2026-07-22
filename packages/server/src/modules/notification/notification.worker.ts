import { Worker, type Job } from 'bullmq';
import { NOTIFICATION_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { dispatchNotification } from './notification.service.js';
import type { NotificationJobData } from './notification.queue.js';

const processNotificationJob = async (
  job: Job<NotificationJobData>
): Promise<void> => {
  await dispatchNotification(job.data);
};

export const startNotificationWorker = (): Worker<NotificationJobData> => {
  const worker = new Worker<NotificationJobData>(
    NOTIFICATION_QUEUE_NAME,
    processNotificationJob,
    {
      connection: bullMqConnection,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(
      error,
      `Notification job failed: type=${job?.data.type} recipientId=${job?.data.recipientId} attempt=${job?.attemptsMade}`
    );
  });

  attachWorkerErrorBackoff(worker, 'Notification');

  logger.info('Notification worker started');
  return worker;
};
