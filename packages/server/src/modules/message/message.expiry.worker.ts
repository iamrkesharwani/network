import { Worker } from 'bullmq';
import {
  MESSAGE_EXPIRY_QUEUE_NAME,
  MESSAGE_EXPIRED_SOCKET_EVENT,
} from '@network/shared';
import {
  attachWorkerErrorBackoff,
  bullMqConnection,
} from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { emitToUser } from '../../core/config/socket.js';
import { storageProvider } from '../../core/providers/provider.js';
import * as messageRepository from './repository/message.repository.js';
import * as conversationRepository from './repository/conversation.repository.js';

export const startMessageExpiryWorker = (): Worker => {
  const worker = new Worker(
    MESSAGE_EXPIRY_QUEUE_NAME,
    async (job) => {
      const { messageId } = job.data as { messageId: string };

      const message = await messageRepository.expireMessage(messageId);
      if (!message || !message.expiredAt) return;

      if (message.attachmentStorageKey) {
        await storageProvider
          .deleteObject(message.attachmentStorageKey)
          .catch((error) =>
            logger.warn(
              error,
              `Message expiry: failed to delete attachment ${message.attachmentStorageKey}`
            )
          );
      }

      const conversation = await conversationRepository.findById(
        message.conversationId.toString()
      );
      if (!conversation) return;

      const payload = {
        conversationId: message.conversationId.toString(),
        messageId,
        expiredAt: message.expiredAt.toISOString(),
      };

      for (const participantId of conversation.participantIds) {
        emitToUser(
          participantId.toString(),
          MESSAGE_EXPIRED_SOCKET_EVENT,
          payload
        );
      }

      logger.info({ messageId }, 'Message expired and content removed');
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Message expiry job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Message expiry');

  logger.info('Message expiry worker started');
  return worker;
};
