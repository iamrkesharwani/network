import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE_NAME } from '@network/shared';
import type {
  NotificationType,
  NotificationTargetType,
  ContentType,
} from '@network/shared';
import { logger } from '../../core/utils/logger.js';
import { bullMqConnection } from '../../core/config/bullmq.js';
import * as blockService from '../block/services/block.service.js';

export interface NotificationJobData {
  type: NotificationType;
  recipientId: string;
  actorId?: string;
  targetType: NotificationTargetType;
  targetId?: string;
  contentType?: ContentType;
  contentId?: string;
  topLevelCommentId?: string;
}

const notificationQueue = new Queue<NotificationJobData>(
  NOTIFICATION_QUEUE_NAME,
  {
    connection: bullMqConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  }
);

export const queueNotification = async (
  data: NotificationJobData
): Promise<void> => {
  if (data.actorId) {
    const blocked = await blockService.isBlocked(data.actorId, data.recipientId);
    if (blocked) return;
  }

  try {
    await notificationQueue.add(data.type, data);
  } catch (error) {
    logger.error(
      error,
      `Failed to enqueue notification job: type=${data.type} recipientId=${data.recipientId}`
    );
    throw error;
  }
};
