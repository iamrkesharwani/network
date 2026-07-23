import {
  MESSAGE_KEY_ROTATION_LAST_ROTATED_STORAGE_KEY_PREFIX,
  MESSAGE_KEY_ROTATION_NUDGE_STORAGE_KEY_PREFIX,
  MESSAGE_KEY_ROTATION_INTERVAL_MS,
  MESSAGE_KEY_ROTATION_NUDGE_THROTTLE_MS,
} from '@network/shared';

const readTimestamp = (key: string): number | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const value = parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
};

export const getLastRotatedAt = (userId: string): number | null =>
  readTimestamp(MESSAGE_KEY_ROTATION_LAST_ROTATED_STORAGE_KEY_PREFIX + userId);

export const recordKeyRotation = (userId: string): void => {
  localStorage.setItem(
    MESSAGE_KEY_ROTATION_LAST_ROTATED_STORAGE_KEY_PREFIX + userId,
    Date.now().toString()
  );
};

export const dismissKeyRotationNudge = (userId: string): void => {
  localStorage.setItem(
    MESSAGE_KEY_ROTATION_NUDGE_STORAGE_KEY_PREFIX + userId,
    Date.now().toString()
  );
};

export const shouldShowKeyRotationNudge = (userId: string): boolean => {
  const lastRotated = getLastRotatedAt(userId);
  if (lastRotated === null) return false;
  if (Date.now() - lastRotated < MESSAGE_KEY_ROTATION_INTERVAL_MS) return false;

  const dismissedAt = readTimestamp(
    MESSAGE_KEY_ROTATION_NUDGE_STORAGE_KEY_PREFIX + userId
  );
  if (!dismissedAt) return true;
  return Date.now() - dismissedAt >= MESSAGE_KEY_ROTATION_NUDGE_THROTTLE_MS;
};
