import type { IMessageResponse } from '@network/shared';
import type { IMessageDocument } from '../models/message.model.js';

export const toMessageResponse = (doc: IMessageDocument): IMessageResponse => ({
  id: doc._id.toString(),
  conversationId: doc.conversationId.toString(),
  senderId: doc.senderId.toString(),
  ciphertext: doc.ciphertext,
  iv: doc.iv,
  encryptedKeys: doc.encryptedKeys.map((entry) => ({
    recipientId: entry.recipientId.toString(),
    encryptedKey: entry.encryptedKey,
  })),
  reactions: doc.reactions.map((reaction) => ({
    userId: reaction.userId.toString(),
    ciphertext: reaction.ciphertext,
    iv: reaction.iv,
    encryptedKeys: reaction.encryptedKeys.map((entry) => ({
      recipientId: entry.recipientId.toString(),
      encryptedKey: entry.encryptedKey,
    })),
    createdAt: reaction.createdAt.toISOString(),
  })),
  createdAt: doc.createdAt.toISOString(),
  ...(doc.replyToMessageId && {
    replyToMessageId: doc.replyToMessageId.toString(),
  }),
  ...(doc.editedAt && { editedAt: doc.editedAt.toISOString() }),
  ...(doc.expiresAt && { expiresAt: doc.expiresAt.toISOString() }),
  ...(doc.expiredAt && { expiredAt: doc.expiredAt.toISOString() }),
  ...(doc.deliveredAt && { deliveredAt: doc.deliveredAt.toISOString() }),
  ...(doc.unsentAt && { unsentAt: doc.unsentAt.toISOString() }),
});
