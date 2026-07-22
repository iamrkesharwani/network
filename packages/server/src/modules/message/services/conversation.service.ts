import type {
  GroupConversationCreateInput,
  GroupUpdateInput,
  IConversationSummary,
  PaginatedResponse,
} from '@network/shared';
import {
  CONVERSATION_READ_SOCKET_EVENT,
  CONVERSATION_UPDATED_SOCKET_EVENT,
  MESSAGE_GROUP_MAX_PARTICIPANTS,
} from '@network/shared';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as userRepository from '../../user/user.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { emitToUser } from '../../../core/config/socket.js';
import { toConversationSummary } from './conversation.mappers.js';
import * as presenceService from './presence.service.js';
import type { IConversationDocument } from '../models/conversation.model.js';

const emitToParticipants = (
  doc: IConversationDocument,
  event: string,
  payload: unknown
): void => {
  for (const participantId of doc.participantIds) {
    emitToUser(participantId.toString(), event, payload);
  }
};

const assertActiveUsersExist = async (userIds: string[]): Promise<void> => {
  const users = await userRepository.findByIds(userIds);
  const activeIds = new Set(
    users.filter((user) => user.status === 'active').map((user) => user._id.toString())
  );

  const missing = userIds.filter((id) => !activeIds.has(id));
  if (missing.length > 0) {
    throw new ApiError(404, 'NOT_FOUND', 'One or more users could not be found.');
  }
};

const getConversationOrThrow = async (
  conversationId: string
): Promise<IConversationDocument> => {
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }
  return conversation;
};

const assertMembership = (
  conversation: IConversationDocument,
  userId: string
): void => {
  const isMember = conversation.participantIds.some(
    (id) => id.toString() === userId
  );
  if (!isMember) {
    throw new ApiError(403, 'FORBIDDEN', 'You are not part of this conversation.');
  }
};

export const createDirectConversation = async (
  userId: string,
  participantId: string
): Promise<IConversationSummary> => {
  if (participantId === userId) {
    throw new ApiError(400, 'BAD_REQUEST', 'You cannot message yourself.');
  }

  await assertActiveUsersExist([participantId]);

  const doc = await conversationRepository.findOrCreateDirect(
    userId,
    participantId
  );
  const participantIds = doc.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds] = await Promise.all([
    doc.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(participantIds),
  ]);

  return toConversationSummary(withParticipants, userId, onlineUserIds);
};

export const createGroupConversation = async (
  userId: string,
  data: GroupConversationCreateInput
): Promise<IConversationSummary> => {
  await assertActiveUsersExist(data.participantIds);

  const doc = await conversationRepository.createGroup(
    userId,
    data.groupName,
    data.participantIds
  );
  const participantIds = doc.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds] = await Promise.all([
    doc.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(participantIds),
  ]);

  return toConversationSummary(withParticipants, userId, onlineUserIds);
};

export const listConversations = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IConversationSummary>, 'success' | 'message'>> => {
  const { data, meta } = await conversationRepository.listByUser(
    userId,
    cursor,
    limit
  );

  const participantIds = Array.from(
    new Set(data.flatMap((doc) => doc.participantIds.map((id) => id.toString())))
  );
  const onlineUserIds = await presenceService.getOnlineUserIds(participantIds);

  return {
    data: data.map((doc) => toConversationSummary(doc, userId, onlineUserIds)),
    meta,
  };
};

export const addParticipants = async (
  userId: string,
  conversationId: string,
  participantIds: string[]
): Promise<IConversationSummary> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  if (conversation.type !== 'group') {
    throw new ApiError(400, 'BAD_REQUEST', 'Only group conversations support adding participants.');
  }

  const existingIds = new Set(
    conversation.participantIds.map((id) => id.toString())
  );
  const newIds = participantIds.filter((id) => !existingIds.has(id));

  if (existingIds.size + newIds.length > MESSAGE_GROUP_MAX_PARTICIPANTS) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `A group cannot exceed ${MESSAGE_GROUP_MAX_PARTICIPANTS} participants.`
    );
  }

  await assertActiveUsersExist(newIds);

  const updated = await conversationRepository.addParticipants(
    conversationId,
    newIds
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }

  const recipientIds = updated.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(recipientIds),
  ]);

  for (const recipientId of recipientIds) {
    emitToUser(
      recipientId,
      CONVERSATION_UPDATED_SOCKET_EVENT,
      toConversationSummary(withParticipants, recipientId, onlineUserIds)
    );
  }
  return toConversationSummary(withParticipants, userId, onlineUserIds);
};

export const updateGroupMeta = async (
  userId: string,
  conversationId: string,
  data: GroupUpdateInput
): Promise<IConversationSummary> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  if (conversation.type !== 'group') {
    throw new ApiError(400, 'BAD_REQUEST', 'Only group conversations can be updated.');
  }

  const updated = await conversationRepository.updateGroupMeta(
    conversationId,
    data
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }

  const recipientIds = updated.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(recipientIds),
  ]);

  for (const recipientId of recipientIds) {
    emitToUser(
      recipientId,
      CONVERSATION_UPDATED_SOCKET_EVENT,
      toConversationSummary(withParticipants, recipientId, onlineUserIds)
    );
  }
  return toConversationSummary(withParticipants, userId, onlineUserIds);
};

export const leaveGroup = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  if (conversation.type !== 'group') {
    throw new ApiError(400, 'BAD_REQUEST', 'You can only leave a group conversation.');
  }

  const updated = await conversationRepository.leaveGroup(conversationId, userId);
  if (updated) {
    emitToParticipants(updated, CONVERSATION_UPDATED_SOCKET_EVENT, {
      conversationId,
      leftUserId: userId,
    });
  }
};

export const markRead = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  await conversationRepository.updateLastReadAt(conversationId, userId);

  emitToUser(userId, CONVERSATION_READ_SOCKET_EVENT, {
    conversationId,
    userId,
    lastReadAt: new Date().toISOString(),
  });
};

export const assertConversationMembership = async (
  userId: string,
  conversationId: string
): Promise<IConversationDocument> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);
  return conversation;
};
