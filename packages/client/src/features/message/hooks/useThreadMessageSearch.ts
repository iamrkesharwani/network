import { useMemo } from 'react';
import { SEARCH_DEBOUNCE_MS, type IMessageResponse } from '@network/shared';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useSearchMessagesQuery } from '../messageApi';
import { decodeMessagePayload } from '../messagePayload';

const isSearchableMessage = (message: IMessageResponse): boolean =>
  !message.unsentAt && !message.expiredAt && !message.moderationRemovedAt;

export const useThreadMessageSearch = (
  conversationId: string,
  query: string,
  loadedMessages: IMessageResponse[]
) => {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const isActive = trimmedQuery.length > 0;

  const localMatches = useMemo(() => {
    if (!trimmedQuery) return [];
    const needle = trimmedQuery.toLowerCase();
    return loadedMessages.filter(
      (message) =>
        isSearchableMessage(message) &&
        decodeMessagePayload(message.content).text.toLowerCase().includes(needle)
    );
  }, [loadedMessages, trimmedQuery]);

  const { data: serverMatchesData, isFetching: isSearching } = useSearchMessagesQuery(
    { conversationId, q: debouncedQuery },
    { skip: !debouncedQuery }
  );

  const matches = useMemo(() => {
    const byId = new Map<string, IMessageResponse>();
    for (const message of localMatches) byId.set(message.id, message);
    for (const message of serverMatchesData?.data ?? []) {
      if (!byId.has(message.id)) byId.set(message.id, message);
    }
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [localMatches, serverMatchesData]);

  return { isActive, matches, isSearching };
};
