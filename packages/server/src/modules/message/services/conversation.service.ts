import type {
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
} from '@network/shared';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as userRepository from '../../user/user.repository.js';
import * as keyBundleService from './keyBundle.service.js';
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
  }

  await keyBundleService.assertAllHaveKeyBundle([userId, participantId]);

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
  await keyBundleService.assertAllHaveKeyBundle([
    userId,
    ...data.participantIds,
  ]);

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

  const participantIds = Array.from(
    new Set(data.flatMap((doc) => doc.participantIds.map((id) => id.toString())))
  );
  const [onlineUserIds, privacyByUserId] = await Promise.all([
    presenceService.getOnlineUserIds(participantIds),
    preferencesService.getResolvedPrivacyByUserIds(participantIds),
  ]);

  return {
    data: data.map((doc) => toConversationSummary(doc, userId, onlineUserIds, privacyByUserId)),
    meta,
  };
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

  const participantIds = Array.from(
    new Set(data.flatMap((doc) => doc.participantIds.map((id) => id.toString())))
  );
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
  await keyBundleService.assertAllHaveKeyBundle(newIds);

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

export const assertConversationMembership = async (
  userId: string,
  conversationId: string
): Promise<IConversationDocument> => {
  const conversation = await getConversationOrThrow(conversationId);
  assertMembership(conversation, userId);
  return conversation;
};
