import type { IConversationSummary } from '@network/shared';

export const getConversationLabel = (conversation: IConversationSummary): string =>
  conversation.type === 'direct'
    ? conversation.otherParticipant.name
    : conversation.groupName;

export const getConversationAvatarProps = (
  conversation: IConversationSummary
): { src: string | undefined; isOnline: boolean | undefined } =>
  conversation.type === 'direct'
    ? {
        src: conversation.otherParticipant.avatarUrl,
        isOnline: conversation.otherParticipant.isOnline,
      }
    : { src: conversation.groupAvatarUrl, isOnline: undefined };
