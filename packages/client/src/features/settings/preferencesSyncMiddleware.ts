import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { PREFERENCES_PATCH_DEBOUNCE_MS } from '@network/shared';
import { setPreferenceSection, type PreferencesState } from './preferencesSlice';
import { preferencesApi } from './preferencesApi';
import { writeStoredPreferences } from './lib/preferencesStorage';

interface PreferencesMiddlewareState {
  preferences: PreferencesState;
  auth: { isAuthenticated: boolean };
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: Record<string, unknown> = {};

export const preferencesSyncMiddleware: Middleware<
  object,
  PreferencesMiddlewareState
> = (store) => (next) => (action) => {
    const result = next(action);
    const typedAction = action as UnknownAction;

    if (setPreferenceSection.match(typedAction)) {
      writeStoredPreferences(store.getState().preferences);

      const { section, patch } = typedAction.payload;
      pendingPatch = {
        ...pendingPatch,
        [section]: {
          ...(pendingPatch[section] as object | undefined),
          ...patch,
        },
      };

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (store.getState().auth.isAuthenticated) {
          store.dispatch(
            preferencesApi.endpoints.patchPreferences.initiate(
              pendingPatch
            ) as unknown as UnknownAction
          );
        }
        pendingPatch = {};
        debounceTimer = null;
      }, PREFERENCES_PATCH_DEBOUNCE_MS);
    }

    return result;
  };
