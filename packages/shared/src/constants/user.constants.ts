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
