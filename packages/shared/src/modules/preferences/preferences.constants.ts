export const PREFERENCES_NOTIFICATION_CATEGORIES = [
  'likes',
  'comments',
  'follows',
  'mentions',
  'moderation',
  'newsletter',
] as const;

export type PreferencesNotificationCategory =
  (typeof PREFERENCES_NOTIFICATION_CATEGORIES)[number];

export const PREFERENCES_DEFAULT_VOLUME = 1;
export const PREFERENCES_DEFAULT_PLAYBACK_RATE = 1;
export const PREFERENCES_PATCH_DEBOUNCE_MS = 500;
