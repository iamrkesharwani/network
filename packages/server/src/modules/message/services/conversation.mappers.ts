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

const isUserOnline = (_userId: string): boolean => false;

const getLastReadAt = (
  lastReadAt: IConversationDocument['lastReadAt'],
  userId: string
): Date | undefined => {
  if (!lastReadAt) return undefined;
  if (lastReadAt instanceof Map) return lastReadAt.get(userId);
  return (lastReadAt as unknown as Record<string, Date>)[userId];
};

const toParticipantSummary = (
  participant: PopulatedParticipant
): IParticipantSummary => {
  const id = participant._id.toString();

  return {
    id,
    username: participant.username,
    name: participant.name,
    ...(participant.avatarUrl && { avatarUrl: participant.avatarUrl }),
    isOnline: isUserOnline(id),
    ...(participant.lastActiveAt && {
      lastActiveAt: participant.lastActiveAt.toISOString(),
    }),
  };
};

export const toConversationSummary = (
  doc: IConversationDocument,
  viewerId: string
): IConversationSummary => {
  const participants = (
    doc.participantIds as unknown as PopulatedParticipant[]
  ).filter((participant) => participant && participant.username);

  const viewerLastReadAt = getLastReadAt(doc.lastReadAt, viewerId);
  const isUnread = !viewerLastReadAt || doc.lastMessageAt > viewerLastReadAt;

  const base = {
    id: doc._id.toString(),
    lastMessageAt: doc.lastMessageAt.toISOString(),
    isUnread,
  };

  if (doc.type === 'group') {
    return {
      ...base,
      type: 'group',
      groupName: doc.groupName ?? '',
      ...(doc.groupAvatarUrl && { groupAvatarUrl: doc.groupAvatarUrl }),
      participants: participants.map(toParticipantSummary),
    };
  }

  const otherParticipant = participants.find(
    (participant) => participant._id.toString() !== viewerId
  );

  return {
    ...base,
    type: 'direct',
    otherParticipant: otherParticipant
      ? toParticipantSummary(otherParticipant)
      : {
          id: '',
          username: 'unknown',
          name: 'Unknown user',
          isOnline: false,
        },
  };
};
