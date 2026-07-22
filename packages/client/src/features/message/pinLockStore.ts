import {
  MESSAGE_PIN_CONFIG_STORAGE_KEY_PREFIX,
  MESSAGE_PIN_NUDGE_STORAGE_KEY_PREFIX,
  MESSAGE_PIN_LAST_ENTRY_STORAGE_KEY_PREFIX,
  MESSAGE_PIN_NUDGE_THROTTLE_MS,
  MESSAGE_PIN_REPROMPT_MS,
  type MessagePinLength,
} from '@network/shared';

interface PinConfig {
  length: MessagePinLength;
}

interface PinNudgeState {
  dismissedAt?: number;
  optedOut?: boolean;
}

const readJson = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const getPinConfig = (userId: string): PinConfig | null =>
  readJson<PinConfig>(MESSAGE_PIN_CONFIG_STORAGE_KEY_PREFIX + userId);

export const setPinConfig = (
  userId: string,
  length: MessagePinLength
): void => {
  localStorage.setItem(
    MESSAGE_PIN_CONFIG_STORAGE_KEY_PREFIX + userId,
    JSON.stringify({ length })
  );
};

export const clearPinConfig = (userId: string): void => {
  localStorage.removeItem(MESSAGE_PIN_CONFIG_STORAGE_KEY_PREFIX + userId);
};

export const isPinConfigured = (userId: string): boolean =>
  Boolean(getPinConfig(userId));

const getNudgeState = (userId: string): PinNudgeState =>
  readJson<PinNudgeState>(MESSAGE_PIN_NUDGE_STORAGE_KEY_PREFIX + userId) ?? {};

export const shouldShowPinNudge = (userId: string): boolean => {
  const state = getNudgeState(userId);
  if (state.optedOut) return false;
  if (!state.dismissedAt) return true;
  return Date.now() - state.dismissedAt >= MESSAGE_PIN_NUDGE_THROTTLE_MS;
};

export const dismissPinNudge = (userId: string): void => {
  localStorage.setItem(
    MESSAGE_PIN_NUDGE_STORAGE_KEY_PREFIX + userId,
    JSON.stringify({ dismissedAt: Date.now() })
  );
};

export const optOutPinNudge = (userId: string): void => {
  localStorage.setItem(
    MESSAGE_PIN_NUDGE_STORAGE_KEY_PREFIX + userId,
    JSON.stringify({ optedOut: true })
  );
};

export const recordPinEntry = (userId: string): void => {
  localStorage.setItem(
    MESSAGE_PIN_LAST_ENTRY_STORAGE_KEY_PREFIX + userId,
    Date.now().toString()
  );
};

export const isPinReentryDue = (userId: string): boolean => {
  const lastEntry = localStorage.getItem(
    MESSAGE_PIN_LAST_ENTRY_STORAGE_KEY_PREFIX + userId
  );
  if (!lastEntry) return true;
  const elapsed = Date.now() - parseInt(lastEntry, 10);
  return elapsed >= MESSAGE_PIN_REPROMPT_MS;
};
