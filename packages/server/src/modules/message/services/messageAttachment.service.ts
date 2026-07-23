import { randomUUID } from 'node:crypto';
import type {
  IMessageAttachmentUploadResult,
  MessageAttachmentType,
} from '@network/shared';
import { storageProvider } from '../../../core/providers/provider.js';
import { encryptBuffer } from './envelopeEncryption.service.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { logger } from '../../../core/utils/logger.js';
import * as conversationService from './conversation.service.js';
import * as messageAttachmentRepository from '../repository/messageAttachment.repository.js';
import type { IPendingAttachment } from '../repository/messageAttachment.repository.js';

export const uploadAttachment = async (
  userId: string,
  conversationId: string,
  file: { buffer: Buffer; mimetype: string; size: number },
  type: MessageAttachmentType,
  duration?: number
): Promise<IMessageAttachmentUploadResult> => {
  await conversationService.assertConversationMembership(userId, conversationId);

  const attachmentId = randomUUID();
  const { key } = await storageProvider.presignUpload(
    'message-attachment',
    userId,
    attachmentId,
    'application/octet-stream',
    file.size
  );

  const { ciphertext, encryptedDataKey, iv } = await encryptBuffer(file.buffer);
  await storageProvider.uploadObject(key, ciphertext, 'application/octet-stream');

  await messageAttachmentRepository.createPendingAttachment(key, {
    ownerId: userId,
    encryptedDataKey,
    iv,
    type,
    mimeType: file.mimetype,
    size: file.size,
    ...(duration !== undefined && { duration }),
  });

  return { storageKey: key };
};

export const resolvePendingAttachment = async (
  userId: string,
  storageKey: string
): Promise<IPendingAttachment> => {
  const pending = await messageAttachmentRepository.getPendingAttachment(storageKey);
  if (!pending || pending.ownerId !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This attachment upload does not belong to you or has expired.'
    );
  }
  return pending;
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
