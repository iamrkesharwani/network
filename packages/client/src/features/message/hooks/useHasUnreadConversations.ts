import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useGetConversationsQuery, CONVERSATION_LIST_ARGS } from '../conversationApi';

export const useHasUnreadConversations = (): boolean => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data } = useGetConversationsQuery(CONVERSATION_LIST_ARGS, {
    skip: !isAuthenticated,
  });

  return (data?.data ?? []).some(
    (conversation) => conversation.isUnread && !conversation.isMuted
  );
};
