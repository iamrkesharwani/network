import type {
  ConversationDisappearingTtl,
  EncryptedKeyEntryInput,
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
} from '@network/shared';
import * as messageRepository from '../repository/message.repository.js';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as conversationService from './conversation.service.js';
import { toConversationSummary } from './conversation.mappers.js';
import * as presenceService from './presence.service.js';
import { toMessageResponse } from './message.mappers.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { emitToUser } from '../../../core/config/socket.js';
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

const assertRecipientCoverage = (
  recipientIds: string[],
  encryptedKeys: EncryptedKeyEntryInput[]
): void => {
  const encryptedRecipientIds = new Set(
    encryptedKeys.map((entry) => entry.recipientId)
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

  assertRecipientCoverage(recipientIds, input.encryptedKeys);

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

  const ttl = conversation.disappearingMessagesTtl;
  const expiresAt =
    ttl === 'off' ? undefined : new Date(Date.now() + DISAPPEARING_TTL_DURATIONS_MS[ttl]);

  const inserted = await messageRepository.insertMessage(
    input.conversationId,
    userId,
    input.ciphertext,
    input.iv,
    input.encryptedKeys,
    input.replyToMessageId,
    expiresAt
  );
  const response = toMessageResponse(inserted);

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
    if (message.expiresAt) {
      await cancelMessageExpiry(messageId);
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

  assertRecipientCoverage(recipientIds, input.encryptedKeys);

  const updated = await messageRepository.setReaction(
    messageId,
    userId,
    input.ciphertext,
    input.iv,
    input.encryptedKeys
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  const response = toMessageResponse(updated);
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

  assertRecipientCoverage(recipientIds, input.encryptedKeys);

  const updated = await messageRepository.editMessage(
    messageId,
    input.ciphertext,
    input.iv,
    input.encryptedKeys
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found.');
  }

  const response = toMessageResponse(updated);

  emitToUserIds(recipientIds, MESSAGE_EDITED_SOCKET_EVENT, {
    conversationId: response.conversationId,
    messageId,
    ciphertext: response.ciphertext,
    iv: response.iv,
    encryptedKeys: response.encryptedKeys,
    editedAt: response.editedAt,
  });

  return response;
};
