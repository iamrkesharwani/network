import type {
  ConversationDisappearingTtl,
  IMessageResponse,
  MessageDeleteScope,
  MessageSendInput,
  MessageReactionSetInput,
  MessageEditInput,
  PaginatedResponse,
} from '@network/shared';
import {
  CONVERSATION_UPDATED_SOCKET_EVENT,
  MESSAGE_DELETED_SOCKET_EVENT,
  MESSAGE_NEW_SOCKET_EVENT,
  MESSAGE_REACTION_UPDATED_SOCKET_EVENT,
  MESSAGE_EDITED_SOCKET_EVENT,
  MESSAGE_EDIT_WINDOW_MS,
  MESSAGE_SEARCH_SCAN_LIMIT,
  MESSAGE_SEARCH_RESULT_LIMIT,
  decodeMessagePayload,
} from '@network/shared';
import * as messageRepository from '../repository/message.repository.js';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as conversationService from './conversation.service.js';
import * as messageAttachmentService from './messageAttachment.service.js';
import { toConversationSummary } from './conversation.mappers.js';
import * as presenceService from './presence.service.js';
import { toMessageResponse, isRedacted } from './message.mappers.js';
import {
  encryptContent,
  decryptContent,
  decryptBuffer,
} from './envelopeEncryption.service.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { emitToUser } from '../../../core/config/socket.js';
import { storageProvider } from '../../../core/providers/provider.js';
import { logger } from '../../../core/utils/logger.js';
import {
  scheduleMessageExpiry,
  cancelMessageExpiry,
} from '../message.expiry.queue.js';

const DISAPPEARING_TTL_DURATIONS_MS: Record<
  Exclude<ConversationDisappearingTtl, 'off'>,
  number
> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

const emitToUserIds = (
  userIds: string[],
  event: string,
  payload: unknown
): void => {
  for (const userId of userIds) {
    emitToUser(userId, event, payload);
  }
};

export const sendMessage = async (
  userId: string,
  input: MessageSendInput
): Promise<IMessageResponse> => {
  const conversation = await conversationService.assertConversationMembership(
    userId,
    input.conversationId
  );

  if (conversation.isModeratorLocked) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This conversation has been locked following a moderation review.'
    );
  }

  const recipientIds = conversation.participantIds.map((id) => id.toString());

  if (input.replyToMessageId) {
    const repliedTo = await messageRepository.findById(input.replyToMessageId);
    if (!repliedTo || repliedTo.conversationId.toString() !== input.conversationId) {
      throw new ApiError(
        400,
        'BAD_REQUEST',
        'The message being replied to is not part of this conversation.'
      );
    }
  }

  const pendingAttachment = input.attachmentStorageKey
    ? await messageAttachmentService.resolvePendingAttachment(
        userId,
        input.attachmentStorageKey
      )
    : undefined;

  const ttl = input.ttlOverride ?? conversation.disappearingMessagesTtl;
  const expiresAt =
    ttl === 'off' ? undefined : new Date(Date.now() + DISAPPEARING_TTL_DURATIONS_MS[ttl]);

  const { ciphertext, iv, encryptedDataKey } = await encryptContent(
    input.content
  );

  const inserted = await messageRepository.insertMessage(
    input.conversationId,
    userId,
    ciphertext,
    iv,
    encryptedDataKey,
    input.replyToMessageId,
    expiresAt,
    pendingAttachment && {
      storageKey: input.attachmentStorageKey!,
      encryptedDataKey: pendingAttachment.encryptedDataKey,
      iv: pendingAttachment.iv,
      type: pendingAttachment.type,
      mimeType: pendingAttachment.mimeType,
      size: pendingAttachment.size,
      ...(pendingAttachment.duration !== undefined && {
        duration: pendingAttachment.duration,
      }),
    }
  );

  if (input.attachmentStorageKey) {
    await messageAttachmentService.confirmPendingAttachment(
      input.attachmentStorageKey
    );
  }

  const response = await toMessageResponse(inserted);

  if (expiresAt) {
    await scheduleMessageExpiry(response.id, expiresAt.getTime() - Date.now());
  }

  emitToUserIds(recipientIds, MESSAGE_NEW_SOCKET_EVENT, response);

  const touched = await conversationRepository.touchLastMessageAt(
    input.conversationId
  );
  if (touched) {
    const [populated, onlineUserIds] = await Promise.all([
      touched.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
      presenceService.getOnlineUserIds(recipientIds),
    ]);
    for (const recipientId of recipientIds) {
      emitToUser(
        recipientId,
        CONVERSATION_UPDATED_SOCKET_EVENT,
        toConversationSummary(populated, recipientId, onlineUserIds)
      );
    }
  }

  return response;
};

export const listMessages = async (
  userId: string,
  conversationId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IMessageResponse>, 'success' | 'message'>> => {
  await conversationService.assertConversationMembership(userId, conversationId);

  const { data, meta } = await messageRepository.listByConversation(
    conversationId,
    userId,
    cursor,
    limit
  );

  return {
    data: await Promise.all(data.map(toMessageResponse)),
    meta,
  };
};

export const searchMessages = async (
  userId: string,
  conversationId: string,
  query: string
): Promise<IMessageResponse[]> => {
  await conversationService.assertConversationMembership(userId, conversationId);

  const candidates = await messageRepository.listRecentByConversation(
    conversationId,
    userId,
    MESSAGE_SEARCH_SCAN_LIMIT
  );

  const normalizedQuery = query.toLowerCase();
  const decoded = await Promise.all(
    candidates
      .filter((doc) => !isRedacted(doc))
      .map(async (doc) => ({
        doc,
        text: decodeMessagePayload(
          await decryptContent(doc.ciphertext, doc.encryptedDataKey, doc.iv)
        ).text,
      }))
  );

  const matches = decoded
    .filter(({ text }) => text.toLowerCase().includes(normalizedQuery))
    .slice(0, MESSAGE_SEARCH_RESULT_LIMIT)
    .map(({ doc }) => doc);

  return Promise.all(matches.map(toMessageResponse));
};

export const deleteMessage = async (
  userId: string,
  messageId: string,
  scope: MessageDeleteScope
): Promise<void> => {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  const conversation = await conversationService.assertConversationMembership(
    userId,
    message.conversationId.toString()
  );

  if (scope === 'everyone') {
    if (message.senderId.toString() !== userId) {
      throw new ApiError(
        403,
        'FORBIDDEN',
        'Only the sender can unsend this message for everyone.'
      );
    }

    await messageRepository.unsendForEveryone(messageId);
    if (message.expiresAt) {
      await cancelMessageExpiry(messageId);
    }
    if (message.attachmentStorageKey) {
      await storageProvider
        .deleteObject(message.attachmentStorageKey)
        .catch((error) =>
          logger.warn(
            error,
            `Unsend: failed to delete attachment ${message.attachmentStorageKey}`
          )
        );
    }

    const recipientIds = conversation.participantIds.map((id) => id.toString());
    emitToUserIds(recipientIds, MESSAGE_DELETED_SOCKET_EVENT, {
      conversationId: message.conversationId.toString(),
      messageId,
      scope,
    });
    return;
  }

  await messageRepository.softDeleteForUser(messageId, userId);

  emitToUser(userId, MESSAGE_DELETED_SOCKET_EVENT, {
    conversationId: message.conversationId.toString(),
    messageId,
    scope,
  });
};

export const getMessageById = async (
  userId: string,
  messageId: string
): Promise<IMessageResponse> => {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  await conversationService.assertConversationMembership(
    userId,
    message.conversationId.toString()
  );

  return toMessageResponse(message);
};

export const getDecryptedAttachment = async (
  userId: string,
  messageId: string
): Promise<{ buffer: Buffer; mimeType: string }> => {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  await conversationService.assertConversationMembership(
    userId,
    message.conversationId.toString()
  );

  if (
    !message.attachmentStorageKey ||
    !message.attachmentEncryptedDataKey ||
    !message.attachmentIv ||
    !message.attachmentMimeType
  ) {
    throw new ApiError(404, 'NOT_FOUND', 'This message has no attachment.');
  }

  const ciphertext = await storageProvider.downloadObject(
    message.attachmentStorageKey
  );
  const buffer = await decryptBuffer(
    ciphertext,
    message.attachmentEncryptedDataKey,
    message.attachmentIv
  );

  return { buffer, mimeType: message.attachmentMimeType };
};

export const setReaction = async (
  userId: string,
  messageId: string,
  input: MessageReactionSetInput
): Promise<IMessageResponse> => {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }
  if (message.unsentAt) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Cannot react to a message that was removed.'
    );
  }

  const conversation = await conversationService.assertConversationMembership(
    userId,
    message.conversationId.toString()
  );
  const recipientIds = conversation.participantIds.map((id) => id.toString());

  const {
    ciphertext,
    iv,
    encryptedDataKey,
  } = await encryptContent(input.content);

  const updated = await messageRepository.setReaction(
    messageId,
    userId,
    ciphertext,
    iv,
    encryptedDataKey
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  const response = await toMessageResponse(updated);
  const reaction = response.reactions.find((entry) => entry.userId === userId);

  emitToUserIds(recipientIds, MESSAGE_REACTION_UPDATED_SOCKET_EVENT, {
    conversationId: response.conversationId,
    messageId,
    userId,
    reaction: reaction ?? null,
  });

  return response;
};

export const removeReaction = async (
  userId: string,
  messageId: string
): Promise<void> => {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  const conversation = await conversationService.assertConversationMembership(
    userId,
    message.conversationId.toString()
  );
  const recipientIds = conversation.participantIds.map((id) => id.toString());

  await messageRepository.removeReaction(messageId, userId);

  emitToUserIds(recipientIds, MESSAGE_REACTION_UPDATED_SOCKET_EVENT, {
    conversationId: message.conversationId.toString(),
    messageId,
    userId,
    reaction: null,
  });
};

export const editMessage = async (
  userId: string,
  messageId: string,
  input: MessageEditInput
): Promise<IMessageResponse> => {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }
  if (message.senderId.toString() !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'Only the sender can edit this message.'
    );
  }
  if (message.unsentAt) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Cannot edit a message that was removed.'
    );
  }
  if (Date.now() - message.createdAt.getTime() > MESSAGE_EDIT_WINDOW_MS) {
    throw new ApiError(
      400,
      'EDIT_WINDOW_EXPIRED',
      'This message can no longer be edited.'
    );
  }

  const conversation = await conversationService.assertConversationMembership(
    userId,
    message.conversationId.toString()
  );
  const recipientIds = conversation.participantIds.map((id) => id.toString());

  const {
    ciphertext,
    iv,
    encryptedDataKey,
  } = await encryptContent(input.content);

  const updated = await messageRepository.editMessage(
    messageId,
    ciphertext,
    iv,
    encryptedDataKey
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  const response = await toMessageResponse(updated);

  emitToUserIds(recipientIds, MESSAGE_EDITED_SOCKET_EVENT, {
    conversationId: response.conversationId,
    messageId,
    content: response.content,
    editedAt: response.editedAt,
  });

  return response;
};
