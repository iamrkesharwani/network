import { CLIENT_ROUTES } from '@network/shared';

export const buildConversationPath = (conversationId: string): string =>
  CLIENT_ROUTES.MESSAGES_CONVERSATION.replace(':conversationId', conversationId);
