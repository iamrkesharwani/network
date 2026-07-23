import type {
  IConversationSummary,
  IParticipantSummary,
} from '@network/shared';
import type { IConversationDocument } from '../models/conversation.model.js';
import type { ResolvedPrivacy } from '../../preferences/preferences.service.js';

interface PopulatedParticipant {
  _id: { toString(): string };
  username: string;
  name: string;
  avatarUrl?: string;
  lastActiveAt?: Date;
}

const getMapValue = (
  map: Map<string, Date> | undefined,
  userId: string
): Date | undefined => {
  if (!map) return undefined;
  if (map instanceof Map) return map.get(userId);
  return (map as unknown as Record<string, Date>)[userId];
};

const toParticipantReadState = (
  lastReadAt: IConversationDocument['lastReadAt'],
  viewerId: string,
  privacyByUserId: ReadonlyMap<string, ResolvedPrivacy>
): Record<string, string> => {
  if (!lastReadAt) return {};

  const viewerReceiptsEnabled = privacyByUserId.get(viewerId)?.readReceipts ?? true;
  if (!viewerReceiptsEnabled) return {};

  const entries =
    lastReadAt instanceof Map
      ? Array.from(lastReadAt.entries())
      : Object.entries(lastReadAt as unknown as Record<string, Date>);

  const readState: Record<string, string> = {};
  for (const [userId, date] of entries) {
    if (!date) continue;
    const participantReceiptsEnabled = privacyByUserId.get(userId)?.readReceipts ?? true;
    if (!participantReceiptsEnabled) continue;
    readState[userId] = new Date(date).toISOString();
  }
  return readState;
};

const toParticipantSummary = (
  participant: PopulatedParticipant,
  onlineUserIds: ReadonlySet<string>,
  viewerId: string,
  privacyByUserId: ReadonlyMap<string, ResolvedPrivacy>
): IParticipantSummary => {
  const id = participant._id.toString();
  const privacy = privacyByUserId.get(id);
  const isSelf = id === viewerId;
  const showLastSeen = isSelf || (privacy?.lastSeen ?? true);
  const showPhoto = isSelf || (privacy?.profilePhotoVisibleInChat ?? true);

  return {
    id,
    username: participant.username,
    name: participant.name,
    ...(showPhoto && participant.avatarUrl && { avatarUrl: participant.avatarUrl }),
    isOnline: showLastSeen && onlineUserIds.has(id),
    ...(showLastSeen && participant.lastActiveAt && {
      lastActiveAt: participant.lastActiveAt.toISOString(),
    }),
  };
};

export const toConversationSummary = (
  doc: IConversationDocument,
  viewerId: string,
  onlineUserIds: ReadonlySet<string> = new Set(),
  privacyByUserId: ReadonlyMap<string, ResolvedPrivacy> = new Map()
): IConversationSummary => {
  const participants = (
    doc.participantIds as unknown as PopulatedParticipant[]
  ).filter((participant) => participant && participant.username);

  const viewerLastReadAt = getMapValue(doc.lastReadAt, viewerId);
  const isUnread = !viewerLastReadAt || doc.lastMessageAt > viewerLastReadAt;

  const viewerMutedUntil = getMapValue(doc.mutedUntil, viewerId);
  const isMuted = Boolean(viewerMutedUntil && viewerMutedUntil.getTime() > Date.now());
  const isArchived = Boolean(getMapValue(doc.archivedAt, viewerId));
  const isPinned = Boolean(getMapValue(doc.pinnedAt, viewerId));

  const base = {
    id: doc._id.toString(),
    lastMessageAt: doc.lastMessageAt.toISOString(),
    isUnread,
    isMuted,
    isArchived,
    isPinned,
    participantReadState: toParticipantReadState(doc.lastReadAt, viewerId, privacyByUserId),
  };

  if (doc.type === 'group') {
    return {
      ...base,
      type: 'group',
      groupName: doc.groupName ?? '',
      ...(doc.groupAvatarUrl && { groupAvatarUrl: doc.groupAvatarUrl }),
      participants: participants.map((participant) =>
        toParticipantSummary(participant, onlineUserIds, viewerId, privacyByUserId)
      ),
    };
  }

  const otherParticipant = participants.find(
    (participant) => participant._id.toString() !== viewerId
  );

  return {
    ...base,
    type: 'direct',
    otherParticipant: otherParticipant
      ? toParticipantSummary(otherParticipant, onlineUserIds, viewerId, privacyByUserId)
      : {
          id: '',
          username: 'unknown',
          name: 'Unknown user',
          isOnline: false,
        },
  };
};
