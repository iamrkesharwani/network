import type {
  IConversationSummary,
  IParticipantSummary,
} from '@network/shared';
import type { IConversationDocument } from '../models/conversation.model.js';

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
  lastReadAt: IConversationDocument['lastReadAt']
): Record<string, string> => {
  if (!lastReadAt) return {};

  const entries =
    lastReadAt instanceof Map
      ? Array.from(lastReadAt.entries())
      : Object.entries(lastReadAt as unknown as Record<string, Date>);

  const readState: Record<string, string> = {};
  for (const [userId, date] of entries) {
    if (date) readState[userId] = new Date(date).toISOString();
  }
  return readState;
};

const toParticipantSummary = (
  participant: PopulatedParticipant,
  onlineUserIds: ReadonlySet<string>
): IParticipantSummary => {
  const id = participant._id.toString();

  return {
    id,
    username: participant.username,
    name: participant.name,
    ...(participant.avatarUrl && { avatarUrl: participant.avatarUrl }),
    isOnline: onlineUserIds.has(id),
    ...(participant.lastActiveAt && {
      lastActiveAt: participant.lastActiveAt.toISOString(),
    }),
  };
};

export const toConversationSummary = (
  doc: IConversationDocument,
  viewerId: string,
  onlineUserIds: ReadonlySet<string> = new Set()
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
    participantReadState: toParticipantReadState(doc.lastReadAt),
  };

  if (doc.type === 'group') {
    return {
      ...base,
      type: 'group',
      groupName: doc.groupName ?? '',
      ...(doc.groupAvatarUrl && { groupAvatarUrl: doc.groupAvatarUrl }),
      participants: participants.map((participant) =>
        toParticipantSummary(participant, onlineUserIds)
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
      ? toParticipantSummary(otherParticipant, onlineUserIds)
      : {
          id: '',
          username: 'unknown',
          name: 'Unknown user',
          isOnline: false,
        },
  };
};
