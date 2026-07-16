import { PREFERENCES_STORAGE_KEY } from '@network/shared';
import {
  mergeWithPreferencesDefaults,
  type PreferencesState,
} from '../preferencesSlice';

export const readStoredPreferences = (): PreferencesState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return raw === null
      ? null
      : mergeWithPreferencesDefaults(
          JSON.parse(raw) as Partial<PreferencesState>
        );
  } catch {
    return null;
  }
};

export const writeStoredPreferences = (state: PreferencesState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state));
  } catch {}
};
