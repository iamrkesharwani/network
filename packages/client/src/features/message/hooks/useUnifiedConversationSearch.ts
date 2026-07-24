import { useMemo } from 'react';
import {
  SEARCH_DEBOUNCE_MS,
  CONVERSATION_SEARCH_RESULT_LIMIT,
  type IConversationSummary,
} from '@network/shared';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import {
  CONVERSATION_LIST_ARGS,
  useGetConversationsQuery,
  useSearchConversationsQuery,
} from '../conversationApi';
import { useSearchCreatorsQuery } from '../../search/searchApi';
import { getConversationLabel } from '../utils/conversationDisplay';

export const useUnifiedConversationSearch = (query: string) => {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const isActive = trimmedQuery.length > 0;

  const { data: conversationsData } = useGetConversationsQuery(CONVERSATION_LIST_ARGS);
  const localMatches = useMemo(() => {
    if (!trimmedQuery) return [];
    const needle = trimmedQuery.toLowerCase();
    return (conversationsData?.data ?? []).filter((conversation) =>
      getConversationLabel(conversation).toLowerCase().includes(needle)
    );
  }, [conversationsData, trimmedQuery]);

  const { data: serverMatchesData, isFetching: isSearchingConversations } =
    useSearchConversationsQuery(
      { q: debouncedQuery, limit: CONVERSATION_SEARCH_RESULT_LIMIT },
      { skip: !debouncedQuery }
    );

  const matchedConversations = useMemo(() => {
    const byId = new Map<string, IConversationSummary>();
    for (const conversation of localMatches) byId.set(conversation.id, conversation);
    for (const conversation of serverMatchesData?.data ?? []) {
      if (!byId.has(conversation.id)) byId.set(conversation.id, conversation);
    }
    return Array.from(byId.values());
  }, [localMatches, serverMatchesData]);

  const { data: peopleData, isFetching: isSearchingPeople } = useSearchCreatorsQuery(
    { q: debouncedQuery, limit: 10 },
    { skip: !debouncedQuery }
  );

  const existingDirectParticipantIds = useMemo(
    () =>
      new Set(
        matchedConversations
          .filter((conversation) => conversation.type === 'direct')
          .map((conversation) => conversation.otherParticipant.id)
      ),
    [matchedConversations]
  );
  const matchedPeople = useMemo(
    () =>
      (peopleData?.data ?? []).filter(
        (person) => !existingDirectParticipantIds.has(person.id)
      ),
    [peopleData, existingDirectParticipantIds]
  );

  return {
    isActive,
    matchedConversations,
    matchedPeople,
    isSearching: isSearchingConversations || isSearchingPeople,
  };
};
