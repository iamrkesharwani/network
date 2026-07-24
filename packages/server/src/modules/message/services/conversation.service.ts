import type {
  ConversationDisappearingTtl,
  ConversationMuteDuration,
  GroupConversationCreateInput,
  GroupUpdateInput,
  IConversationSummary,
  PaginatedResponse,
} from '@network/shared';
import {
  CONVERSATION_READ_SOCKET_EVENT,
  CONVERSATION_UPDATED_SOCKET_EVENT,
  MESSAGE_GROUP_MAX_PARTICIPANTS,
  MESSAGE_COLD_OUTREACH_MAX_PER_HOUR,
  getTrustTier,
} from '@network/shared';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as messageColdOutreachRepository from '../repository/messageColdOutreach.repository.js';
import * as userRepository from '../../user/user.repository.js';
import * as creatorRepository from '../../creator/creator.repository.js';
import * as preferencesService from '../../preferences/preferences.service.js';
import * as followService from '../../follow/services/follow.crud.service.js';
import * as blockService from '../../block/services/block.service.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { emitToUser } from '../../../core/config/socket.js';
import { toConversationSummary } from './conversation.mappers.js';
import * as presenceService from './presence.service.js';
import { imageProvider } from '../../../core/providers/provider.js';
import type { IConversationDocument } from '../models/conversation.model.js';

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

const toParticipantIds = (docs: IConversationDocument[]): string[] =>
  Array.from(
    new Set(
      docs.flatMap((doc) =>
        (
          doc.participantIds as unknown as { _id: { toString(): string } }[]
        ).map((participant) => participant._id.toString())
      )
    )
  );

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

const assertCanMessage = async (
  actorId: string,
  targetId: string
): Promise<void> => {
  const privacyByUserId = await preferencesService.getResolvedPrivacyByUserIds([
    targetId,
  ]);
  const audience = privacyByUserId.get(targetId)?.whoCanMessageMe;

  if (!audience || audience === 'everyone') return;

  if (audience === 'nobody') {
    throw new ApiError(403, 'FORBIDDEN', 'This user is not accepting new messages.');
  }

  const isFollower = await followService.isFollowing(actorId, targetId);
  if (!isFollower) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This user only accepts messages from their followers.'
    );
  }
};

const assertCanAddToGroup = async (
  actorId: string,
  targetIds: string[]
): Promise<void> => {
  if (targetIds.length === 0) return;

  const blockedWithActor = await blockService.getBlockedUserIds(actorId);

  const privacyByUserId = await preferencesService.getResolvedPrivacyByUserIds(
    targetIds
  );

  const nobodyIds = targetIds.filter(
    (id) =>
      !blockedWithActor.has(id) &&
      privacyByUserId.get(id)?.whoCanAddToGroup === 'nobody'
  );
  const followersOnlyIds = targetIds.filter(
    (id) =>
      !blockedWithActor.has(id) &&
      privacyByUserId.get(id)?.whoCanAddToGroup === 'followers'
  );

  const followedSet = await followService.getFollowedSet(actorId, followersOnlyIds);
  const notFollowedIds = followersOnlyIds.filter((id) => !followedSet.has(id));

  const blockedIds = targetIds.filter((id) => blockedWithActor.has(id));
  const restrictedIds = [...blockedIds, ...nobodyIds, ...notFollowedIds];
  if (restrictedIds.length === 0) return;

  const restrictedUsers = await userRepository.findByIds(restrictedIds);
  const usernames = restrictedUsers.map((user) => user.username).join(', ');
  throw new ApiError(
    403,
    'FORBIDDEN',
    `Cannot add ${usernames} to this group due to their privacy settings.`
  );
};

const assertColdOutreachAllowed = async (userId: string): Promise<void> => {
  const creatorDoc = await creatorRepository.findByUserId(userId);
  const tier = getTrustTier(creatorDoc?.trustScore ?? 0);
  if (tier.id !== 'NEWCOMER') return;

  const count =
    await messageColdOutreachRepository.incrementColdOutreachCount(userId);
  if (count > MESSAGE_COLD_OUTREACH_MAX_PER_HOUR) {
    throw new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'New accounts can only start a limited number of new conversations per hour. Please try again later.'
    );
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

  const blocked = await blockService.isBlocked(userId, participantId);
  if (blocked) {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot message this user.');
  }

  const alreadyExists = await conversationRepository.directExists(
    userId,
    participantId
  );
  if (!alreadyExists) {
    await assertCanMessage(userId, participantId);
    await assertColdOutreachAllowed(userId);
  }

  const doc = await conversationRepository.findOrCreateDirect(
    userId,
    participantId
  );
  const participantIds = doc.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    doc.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
};

export const createGroupConversation = async (
  userId: string,
  data: GroupConversationCreateInput
): Promise<IConversationSummary> => {
  await assertActiveUsersExist(data.participantIds);
  await assertCanAddToGroup(userId, data.participantIds);

  const doc = await conversationRepository.createGroup(
    userId,
    data.groupName,
    data.participantIds
  );
  const participantIds = doc.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    doc.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
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

  const participantIds = toParticipantIds(data);
  const [onlineUserIds, privacyByUserId] = await Promise.all([
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return {
    data: data.map((doc) => toConversationSummary(doc, userId, onlineUserIds, privacyByUserId)),
    meta,
  };
};

export const searchConversations = async (
  userId: string,
  query: string,
  limit: number
): Promise<IConversationSummary[]> => {
  const docs = await conversationRepository.searchByUser(userId, query, limit);

  const participantIds = toParticipantIds(docs);
  const [onlineUserIds, privacyByUserId] = await Promise.all([
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return docs.map((doc) =>
    toConversationSummary(doc, userId, onlineUserIds, privacyByUserId)
  );
};

export const listArchivedConversations = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IConversationSummary>, 'success' | 'message'>> => {
  const { data, meta } = await conversationRepository.listArchivedByUser(
    userId,
    cursor,
    limit
  );

  const participantIds = toParticipantIds(data);
  const [onlineUserIds, privacyByUserId] = await Promise.all([
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return {
    data: data.map((doc) => toConversationSummary(doc, userId, onlineUserIds, privacyByUserId)),
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
  await assertCanAddToGroup(userId, newIds);

  const updated = await conversationRepository.addParticipants(
    conversationId,
    newIds
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }

  const recipientIds = updated.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(recipientIds),
    preferencesService.getResolvedPrivacyByUserIds(recipientIds),
  ]);

  for (const recipientId of recipientIds) {
    emitToUser(
      recipientId,
      CONVERSATION_UPDATED_SOCKET_EVENT,
      toConversationSummary(withParticipants, recipientId, onlineUserIds, privacyByUserId)
    );
  }
  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
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
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(recipientIds),
    preferencesService.getResolvedPrivacyByUserIds(recipientIds),
  ]);

  for (const recipientId of recipientIds) {
    emitToUser(
      recipientId,
      CONVERSATION_UPDATED_SOCKET_EVENT,
      toConversationSummary(withParticipants, recipientId, onlineUserIds, privacyByUserId)
    );
  }
  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
};

export const uploadGroupAvatar = async (
  userId: string,
  conversationId: string,
  buffer: Buffer,
  mimeType: string
): Promise<IConversationSummary> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  if (conversation.type !== 'group') {
    throw new ApiError(400, 'BAD_REQUEST', 'Only group conversations have a group photo.');
  }

  const previousAvatarUrl = conversation.groupAvatarUrl;
  const groupAvatarUrl = await imageProvider.uploadImage(buffer, mimeType);

  const updated = await conversationRepository.updateGroupMeta(conversationId, {
    groupAvatarUrl,
  });
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }

  if (previousAvatarUrl) {
    await imageProvider.deleteImage(previousAvatarUrl);
  }

  const recipientIds = updated.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(recipientIds),
    preferencesService.getResolvedPrivacyByUserIds(recipientIds),
  ]);

  for (const recipientId of recipientIds) {
    emitToUser(
      recipientId,
      CONVERSATION_UPDATED_SOCKET_EVENT,
      toConversationSummary(withParticipants, recipientId, onlineUserIds, privacyByUserId)
    );
  }
  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
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
    const recipientIds = updated.participantIds.map((id) => id.toString());
    const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
      updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
      presenceService.getOnlineUserIds(recipientIds),
      preferencesService.getResolvedPrivacyByUserIds(recipientIds),
    ]);

    for (const recipientId of recipientIds) {
      emitToUser(
        recipientId,
        CONVERSATION_UPDATED_SOCKET_EVENT,
        toConversationSummary(withParticipants, recipientId, onlineUserIds, privacyByUserId)
      );
    }
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

export const markAllAsRead = async (userId: string): Promise<void> => {
  await conversationRepository.markAllRead(userId);
};

const MUTE_DURATION_MS: Record<Exclude<ConversationMuteDuration, 'forever'>, number> = {
  '8h': 8 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};
const MUTE_FOREVER_DATE = new Date('9999-12-31T23:59:59.999Z');

const resolveMutedUntil = (duration: ConversationMuteDuration): Date =>
  duration === 'forever'
    ? MUTE_FOREVER_DATE
    : new Date(Date.now() + MUTE_DURATION_MS[duration]);

const applyParticipantFlagUpdate = async (
  userId: string,
  conversationId: string,
  updater: () => Promise<IConversationDocument | null>
): Promise<IConversationSummary> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  const updated = await updater();
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }

  const participantIds = updated.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
};

export const muteConversation = (
  userId: string,
  conversationId: string,
  duration: ConversationMuteDuration
): Promise<IConversationSummary> =>
  applyParticipantFlagUpdate(userId, conversationId, () =>
    conversationRepository.setMuted(conversationId, userId, resolveMutedUntil(duration))
  );

export const unmuteConversation = (
  userId: string,
  conversationId: string
): Promise<IConversationSummary> =>
  applyParticipantFlagUpdate(userId, conversationId, () =>
    conversationRepository.setMuted(conversationId, userId, null)
  );

export const archiveConversation = (
  userId: string,
  conversationId: string
): Promise<IConversationSummary> =>
  applyParticipantFlagUpdate(userId, conversationId, () =>
    conversationRepository.setArchived(conversationId, userId, true)
  );

export const unarchiveConversation = (
  userId: string,
  conversationId: string
): Promise<IConversationSummary> =>
  applyParticipantFlagUpdate(userId, conversationId, () =>
    conversationRepository.setArchived(conversationId, userId, false)
  );

export const pinConversation = (
  userId: string,
  conversationId: string
): Promise<IConversationSummary> =>
  applyParticipantFlagUpdate(userId, conversationId, () =>
    conversationRepository.setPinned(conversationId, userId, true)
  );

export const unpinConversation = (
  userId: string,
  conversationId: string
): Promise<IConversationSummary> =>
  applyParticipantFlagUpdate(userId, conversationId, () =>
    conversationRepository.setPinned(conversationId, userId, false)
  );

export const setDisappearingMessagesTtl = async (
  userId: string,
  conversationId: string,
  ttl: ConversationDisappearingTtl
): Promise<IConversationSummary> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);

  if (conversation.type === 'group' && conversation.createdBy.toString() !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'Only the group creator can change disappearing messages for this group.'
    );
  }

  const updated = await conversationRepository.setDisappearingTtl(
    conversationId,
    ttl
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found.');
  }

  const recipientIds = updated.participantIds.map((id) => id.toString());
  const [withParticipants, onlineUserIds, privacyByUserId] = await Promise.all([
    updated.populate('participantIds', 'username name avatarUrl lastActiveAt status'),
    presenceService.getOnlineUserIds(recipientIds),
    preferencesService.getResolvedPrivacyByUserIds(recipientIds),
  ]);

  for (const recipientId of recipientIds) {
    emitToUser(
      recipientId,
      CONVERSATION_UPDATED_SOCKET_EVENT,
      toConversationSummary(withParticipants, recipientId, onlineUserIds, privacyByUserId)
    );
  }
  return toConversationSummary(withParticipants, userId, onlineUserIds, privacyByUserId);
};

export const assertConversationMembership = async (
  userId: string,
  conversationId: string
): Promise<IConversationDocument> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);
  return conversation;
};
