import { useCallback } from 'react';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { searchApi } from '../searchApi';
import { useLocalRecentSearches } from './useLocalRecentSearches';

export const useRecentSearches = () => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const local = useLocalRecentSearches();

  const remoteQuery = searchApi.useGetRecentSearchesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addRecentMutation] = searchApi.useAddRecentSearchMutation();
  const [removeRecentMutation] = searchApi.useRemoveRecentSearchMutation();
  const [clearRecentMutation] = searchApi.useClearRecentSearchesMutation();

  const recent = isAuthenticated
    ? (remoteQuery.data?.data.recent ?? [])
    : local.recent;

  const addRecent = useCallback(
    (query: string) => {
      if (isAuthenticated) {
        void addRecentMutation({ q: query });
      } else {
        local.addRecent(query);
      }
    },
    [isAuthenticated, addRecentMutation, local]
  );

  const removeRecent = useCallback(
    (query: string) => {
      if (isAuthenticated) {
        void removeRecentMutation({ q: query });
      } else {
        local.removeRecent(query);
      }
    },
    [isAuthenticated, removeRecentMutation, local]
  );

  const clearRecent = useCallback(() => {
    if (isAuthenticated) {
      void clearRecentMutation();
    } else {
      local.clearRecent();
    }
  }, [isAuthenticated, clearRecentMutation, local]);

  return { recent, addRecent, removeRecent, clearRecent };
};
