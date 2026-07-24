import type { IMessageResponse } from '@network/shared';
import type { IMessageDocument } from '../models/message.model.js';
import { decryptContent } from './envelopeEncryption.service.js';

export const isRedacted = (doc: IMessageDocument): boolean =>
  Boolean(doc.unsentAt || doc.expiredAt || doc.moderationRemovedAt);

const decryptMessageContent = (doc: IMessageDocument): Promise<string> =>
  isRedacted(doc)
    ? Promise.resolve('')
    : decryptContent(doc.ciphertext, doc.encryptedDataKey, doc.iv);

export const toMessageResponse = async (
  doc: IMessageDocument
): Promise<IMessageResponse> => {
  const [content, reactions] = await Promise.all([
    decryptMessageContent(doc),
    Promise.all(
      (doc.reactions ?? []).map(async (reaction) => ({
        userId: reaction.userId.toString(),
        content: await decryptContent(
          reaction.ciphertext,
          reaction.encryptedDataKey,
          reaction.iv
        ),
        createdAt: reaction.createdAt.toISOString(),
      }))
    ),
  ]);

  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId.toString(),
    senderId: doc.senderId.toString(),
    content,
    reactions,
    createdAt: doc.createdAt.toISOString(),
    ...(doc.replyToMessageId && {
      replyToMessageId: doc.replyToMessageId.toString(),
    }),
    ...(doc.editedAt && { editedAt: doc.editedAt.toISOString() }),
    ...(doc.expiresAt && { expiresAt: doc.expiresAt.toISOString() }),
    ...(doc.expiredAt && { expiredAt: doc.expiredAt.toISOString() }),
    ...(doc.moderationRemovedAt && {
      moderationRemovedAt: doc.moderationRemovedAt.toISOString(),
    }),
    ...(doc.deliveredAt && { deliveredAt: doc.deliveredAt.toISOString() }),
    ...(doc.unsentAt && { unsentAt: doc.unsentAt.toISOString() }),
    ...(doc.attachmentType && { attachmentType: doc.attachmentType }),
    ...(doc.attachmentMimeType && {
      attachmentMimeType: doc.attachmentMimeType,
    }),
    ...(doc.attachmentSize !== undefined && {
      attachmentSize: doc.attachmentSize,
    }),
    ...(doc.attachmentDuration !== undefined && {
      attachmentDuration: doc.attachmentDuration,
    }),
  };
};
