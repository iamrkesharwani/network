export const PREFERENCES_NOTIFICATION_CATEGORIES = [
  'likes',
  'comments',
  'follows',
  'mentions',
  'moderation',
  'newsletter',
  'reports',
  'appeals',
  'uploads',
] as const;



export const PREFERENCES_DEFAULT_VOLUME = 1;
export const PREFERENCES_DEFAULT_PLAYBACK_RATE = 1;
export const PREFERENCES_PATCH_DEBOUNCE_MS = 500;

export const PRIVACY_MESSAGE_AUDIENCES = ['everyone', 'followers', 'nobody'] as const;
export const PRIVACY_GROUP_ADD_AUDIENCES = ['everyone', 'followers', 'nobody'] as const;

export const PREFERENCES_DEFAULT_PRIVACY = {
  whoCanMessageMe: 'everyone',
  whoCanAddToGroup: 'everyone',
  readReceipts: true,
  lastSeen: true,
  profilePhotoVisibleInChat: true,
  aboutVisibleInChat: true,
  typingIndicator: true,
} as const;
