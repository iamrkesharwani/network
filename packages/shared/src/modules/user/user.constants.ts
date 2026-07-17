export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const USER_ROLES = ['user', 'moderator', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const DEFAULT_USER_ROLE: UserRole = 'user';
export const USERNAME_MAX_GENERATION_ATTEMPTS = 5;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 50;
export const NAME_MIN_LENGTH = 3;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const BIO_MAX_LENGTH = 160;
export const PROFILE_BIO_PREVIEW_MAX_LENGTH = 100;
export const PROFILE_CONTENT_TYPES = ['video', 'short', 'post'] as const;
export type ProfileContentType = (typeof PROFILE_CONTENT_TYPES)[number];

export const USERNAME_CHANGE_COOLDOWN_DAYS = 30;
export const MIN_AGE_YEARS = 13;

export const GENDER_OPTIONS = [
  'male',
  'female',
  'others',
  'prefer-not-to-say',
] as const;
export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const RELATIONSHIP_STATUSES = [
  'single',
  'in-a-relationship',
  'engaged',
  'married',
  'prefer-not-to-say',
] as const;
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];

export const GENDER_SELF_DESCRIBE_MAX_LENGTH = 50;
export const PRONOUN_MAX_LENGTH = 20;
export const PRONOUNS_MAX_COUNT = 3;
export const WEBSITE_MAX_LENGTH = 2048;
export const PHONE_NUMBER_MAX_LENGTH = 15;

export const SOCIAL_LINKS_MAX = 10;
export const SOCIAL_LINK_PLATFORM_MAX_LENGTH = 30;

export const SOCIAL_PLATFORMS = [
  'x',
  'instagram',
  'youtube',
  'linkedin',
  'github',
  'facebook',
  'other',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const USER_STATUSES = ['active', 'deactivated', 'pending_deletion'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
export const DEFAULT_USER_STATUS: UserStatus = 'active';
