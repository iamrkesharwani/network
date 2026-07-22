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
  createdAt: doc.createdAt.toISOString(),
  ...(doc.deliveredAt && { deliveredAt: doc.deliveredAt.toISOString() }),
  ...(doc.unsentAt && { unsentAt: doc.unsentAt.toISOString() }),
});
