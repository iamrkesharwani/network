import { randomUUID } from 'node:crypto';
import type {
  IMessageAttachmentPresignResult,
  MessageAttachmentPresignInput,
} from '@network/shared';
import { storageProvider } from '../../../core/providers/provider.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { logger } from '../../../core/utils/logger.js';
import * as conversationService from './conversation.service.js';
import * as messageAttachmentRepository from '../repository/messageAttachment.repository.js';

export const presignAttachmentUpload = async (
  userId: string,
  input: MessageAttachmentPresignInput
): Promise<IMessageAttachmentPresignResult> => {
  await conversationService.assertConversationMembership(
    userId,
    input.conversationId
  );

  const attachmentId = randomUUID();
  const { url, key } = await storageProvider.presignUpload(
    'message-attachment',
    userId,
    attachmentId,
    'application/octet-stream',
    input.contentLength
  );

  await messageAttachmentRepository.createPendingAttachment(key, userId);

  return { storageKey: key, uploadUrl: url };
};

export const assertOwnedPendingAttachment = async (
  userId: string,
  storageKey: string
): Promise<void> => {
  const owner =
    await messageAttachmentRepository.getPendingAttachmentOwner(storageKey);
  if (owner !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This attachment upload does not belong to you or has expired.'
    );
  }
};

export const confirmPendingAttachment = (storageKey: string): Promise<void> =>
  messageAttachmentRepository.confirmPendingAttachment(storageKey);

export const reapExpiredPendingAttachments = async (): Promise<number> => {
  const storageKeys =
    await messageAttachmentRepository.getExpiredPendingStorageKeys();
  let reaped = 0;

  for (const storageKey of storageKeys) {
    try {
      await storageProvider
        .deleteObject(storageKey)
        .catch((error) =>
          logger.warn(
            error,
            `Message attachment reaper: failed to delete storage object ${storageKey}`
          )
        );
      await messageAttachmentRepository.removeFromPendingIndex(storageKey);
      reaped += 1;
    } catch (error) {
      logger.warn(
        error,
        `Message attachment reaper: failed to reap pending attachment ${storageKey}`
      );
    }
  }

  return reaped;
};
