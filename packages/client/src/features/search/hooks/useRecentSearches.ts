import { useCallback, useState } from 'react';
import {
  RECENT_SEARCHES_MAX,
  RECENT_SEARCHES_STORAGE_KEY,
} from '@network/shared';

const readStored = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
};

export const useRecentSearches = () => {
  const [recent, setRecent] = useState<string[]>(readStored);

  const persist = useCallback((next: string[]) => {
    setRecent(next);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(next)
    );
  }, []);

  const addRecent = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((current) => {
      const next = [
        trimmed,
        ...current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, RECENT_SEARCHES_MAX);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          RECENT_SEARCHES_STORAGE_KEY,
          JSON.stringify(next)
        );
      }
      return next;
    });
  }, []);

  const removeRecent = useCallback((query: string) => {
    setRecent((current) => {
      const next = current.filter((q) => q !== query);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          RECENT_SEARCHES_STORAGE_KEY,
          JSON.stringify(next)
        );
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => persist([]), [persist]);

  return { recent, addRecent, removeRecent, clearRecent };
};
