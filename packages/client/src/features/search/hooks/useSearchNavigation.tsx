import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CLIENT_ROUTES, SEARCH_DEBOUNCE_MS } from '@network/shared';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export const useSearchNavigation = (initialFocus = false) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedSearchInput = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    navigate(`${CLIENT_ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') e.currentTarget.blur();
  };

  const handleClearSearch = () => {
    setSearchInput('');
    navigate(CLIENT_ROUTES.FEED);
    searchInputRef.current?.focus();
  };

  return {
    searchInput,
    setSearchInput,
    searchInputRef,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleClearSearch,
  };
};
