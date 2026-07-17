export const SEARCH_DEBOUNCE_MS = 350;
export const SEARCH_FOCUS_SHORTCUT_KEY = 'k';
export const TEXT_ENGINE_TAG = 't:';
export const PREFIX_ENGINE_TAG = 'p:';
export const WORD_PATTERN = /[a-z0-9]+/g;
export const RECENT_SEARCHES_MAX = 6;

export const SEARCH_SUGGESTION_LIMITS = {
  creator: 3,
  video: 3,
  short: 2,
  post: 2,
} as const;

export const TYPESENSE_COLLECTIONS = {
  USER: 'users',
  VIDEO: 'videos',
  SHORT: 'shorts',
  POST: 'posts',
} as const;
