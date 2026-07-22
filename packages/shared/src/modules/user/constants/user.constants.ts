import type { UserRole, UserStatus } from '../types/user.types.js';

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const USER_ROLES = ['user', 'moderator', 'admin'] as const;
export const DEFAULT_USER_ROLE: UserRole = 'user';
export const USERNAME_MAX_GENERATION_ATTEMPTS = 5;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 50;
export const NAME_MIN_LENGTH = 3;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_CHARSET_PATTERN = '[a-z0-9_]';
export const USERNAME_REGEX = new RegExp(`^${USERNAME_CHARSET_PATTERN}+$`);
export const BIO_MAX_LENGTH = 160;
export const PROFILE_CONTENT_TYPES = ['video', 'short', 'post'] as const;
export const USERNAME_CHANGE_COOLDOWN_DAYS = 30;
export const GENDER_SELF_DESCRIBE_MAX_LENGTH = 50;
export const PRONOUN_MAX_LENGTH = 20;
export const PRONOUNS_MAX_COUNT = 3;
export const WEBSITE_MAX_LENGTH = 2048;
export const PHONE_NUMBER_MAX_LENGTH = 15;
export const SOCIAL_LINKS_MAX = 10;
export const DEFAULT_USER_STATUS: UserStatus = 'active';
export const SOCIAL_LINK_PLATFORM_MAX_LENGTH = 30;
export const MIN_AGE_YEARS = 13;
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_BANNER_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const BANNER_ASPECT_RATIO = 3;
export const BANNER_WIDTH_PX = 1500;
export const BANNER_HEIGHT_PX = 500;

export const GENDER_OPTIONS = [
  'male',
  'female',
  'others',
  'prefer-not-to-say',
] as const;

export const RELATIONSHIP_STATUSES = [
  'single',
  'in-a-relationship',
  'engaged',
  'married',
  'prefer-not-to-say',
] as const;

export const USER_STATUSES = [
  'active',
  'deactivated',
  'pending_deletion',
] as const;

export const MODERATION_STATUS = [
  'active',
  'jury_removed',
  'admin_removed',
] as const;
