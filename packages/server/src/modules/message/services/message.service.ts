import type {
  IMessageResponse,
  MessageDeleteScope,
  MessageSendInput,
  PaginatedResponse,
} from '@network/shared';
import {
  CONVERSATION_UPDATED_SOCKET_EVENT,
  MESSAGE_DELETED_SOCKET_EVENT,
  MESSAGE_NEW_SOCKET_EVENT,
} from '@network/shared';
import * as messageRepository from '../repository/message.repository.js';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as conversationService from './conversation.service.js';
import { toConversationSummary } from './conversation.mappers.js';
import * as presenceService from './presence.service.js';
import { toMessageResponse } from './message.mappers.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { emitToUser } from '../../../core/config/socket.js';

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
  const recipientIds = conversation.participantIds.map((id) => id.toString());

  const encryptedRecipientIds = new Set(
    input.encryptedKeys.map((entry) => entry.recipientId)
  );
  const missingRecipients = recipientIds.filter(
    (id) => !encryptedRecipientIds.has(id)
  );
  if (missingRecipients.length > 0) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Message is missing an encrypted key for one or more participants.'
    );
  }

  const inserted = await messageRepository.insertMessage(
    input.conversationId,
    userId,
    input.ciphertext,
    input.iv,
    input.encryptedKeys
  );
  const response = toMessageResponse(inserted);

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
    data: data.map(toMessageResponse),
    meta,
  };
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
