import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CLIENT_ROUTES, SEARCH_DEBOUNCE_MS } from '@network/shared';
import type {
  IPostResponse,
  IPublicProfile,
  IShortResponse,
  IVideoResponse,
} from '@network/shared';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import { searchApi } from '../searchApi';
import { useRecentSearches } from './useRecentSearches';

export type SuggestionListItem =
  | { kind: 'recent'; query: string }
  | { kind: 'creator'; creator: IPublicProfile }
  | { kind: 'video'; video: IVideoResponse }
  | { kind: 'short'; short: IShortResponse }
  | { kind: 'post'; post: IPostResponse }
  | { kind: 'see-all'; query: string };

export const useSearchNavigation = (initialFocus = false) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedSearchInput = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { recent, addRecent, removeRecent } = useRecentSearches();

  const trimmedDebounced = debouncedSearchInput.trim();

  const suggestionsQuery = searchApi.useSearchSuggestionsQuery(
    { q: trimmedDebounced },
    { skip: !trimmedDebounced }
  );
  const suggestions = suggestionsQuery.data?.data;

  const items = useMemo<SuggestionListItem[]>(() => {
    if (!trimmedDebounced) {
      return recent.map(
        (query): SuggestionListItem => ({ kind: 'recent', query })
      );
    }
    if (!suggestions) return [];
    return [
      ...suggestions.creators.map(
        (creator): SuggestionListItem => ({ kind: 'creator', creator })
      ),
      ...suggestions.videos.map(
        (video): SuggestionListItem => ({ kind: 'video', video })
      ),
      ...suggestions.shorts.map(
        (short): SuggestionListItem => ({ kind: 'short', short })
      ),
      ...suggestions.posts.map(
        (post): SuggestionListItem => ({ kind: 'post', post })
      ),
      { kind: 'see-all', query: trimmedDebounced },
    ];
  }, [trimmedDebounced, recent, suggestions]);

  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const trimmed = debouncedSearchInput.trim();
    const currentQuery = searchParams.get('q') ?? '';

    if (!trimmed) {
      if (currentQuery) navigate(CLIENT_ROUTES.FEED);
      return;
    }
    if (trimmed === currentQuery) return;
    navigate(`${CLIENT_ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
  }, [debouncedSearchInput]);

  useEffect(() => {
    if (initialFocus) searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchInput, isOpen]);

  const goToItem = (item: SuggestionListItem) => {
    switch (item.kind) {
      case 'recent':
        setSearchInput(item.query);
        navigate(`${CLIENT_ROUTES.SEARCH}?q=${encodeURIComponent(item.query)}`);
        break;
      case 'creator':
        navigate(buildProfilePath(item.creator.username));
        break;
      case 'video':
        navigate(CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', item.video.id));
        break;
      case 'short':
        navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', item.short.id));
        break;
      case 'post':
        navigate(CLIENT_ROUTES.POST_WATCH.replace(':postId', item.post.id));
        break;
      case 'see-all':
        addRecent(item.query);
        navigate(`${CLIENT_ROUTES.SEARCH}?q=${encodeURIComponent(item.query)}`);
        break;
    }
    setIsOpen(false);
    searchInputRef.current?.blur();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    navigate(`${CLIENT_ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
    searchInputRef.current?.blur();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      setIsOpen(false);
      return;
    }
    if (!isOpen || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      goToItem(items[highlightedIndex]!);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    navigate(CLIENT_ROUTES.FEED);
    searchInputRef.current?.focus();
  };

  const handleSearchFocus = () => setIsOpen(true);
  const handleSearchBlur = () => setIsOpen(false);

  return {
    searchInput,
    setSearchInput,
    searchInputRef,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleClearSearch,
    handleSearchFocus,
    handleSearchBlur,
    isOpen,
    items,
    highlightedIndex,
    setHighlightedIndex,
    goToItem,
    removeRecent,
    isSuggestionsLoading: suggestionsQuery.isFetching,
  };
};
