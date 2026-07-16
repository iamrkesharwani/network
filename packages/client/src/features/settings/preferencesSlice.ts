import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  IPreferencesAppearance,
  IPreferencesLayout,
  IPreferencesPlayback,
  IPreferencesNotifications,
} from '@network/shared';

export interface PreferencesState {
  version: number;
  updatedAt: string | null;
  appearance: IPreferencesAppearance;
  layout: IPreferencesLayout;
  playback: IPreferencesPlayback;
  notifications: IPreferencesNotifications;
}

export const preferencesInitialState: PreferencesState = {
  version: 0,
  updatedAt: null,
  appearance: {},
  layout: {},
  playback: {},
  notifications: {},
};

export type SetPreferenceSectionAction =
  | { section: 'appearance'; patch: Partial<IPreferencesAppearance> }
  | { section: 'layout'; patch: Partial<IPreferencesLayout> }
  | { section: 'playback'; patch: Partial<IPreferencesPlayback> }
  | { section: 'notifications'; patch: Partial<IPreferencesNotifications> };

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: preferencesInitialState,
  reducers: {
    setPreferenceSection: (
      state,
      action: PayloadAction<SetPreferenceSectionAction>
    ) => {
      switch (action.payload.section) {
        case 'appearance':
          state.appearance = { ...state.appearance, ...action.payload.patch };
          break;
        case 'layout':
          state.layout = {
            ...state.layout,
            ...action.payload.patch,
            profileViewMode: {
              ...state.layout.profileViewMode,
              ...action.payload.patch.profileViewMode,
            },
          };
          break;
        case 'playback':
          state.playback = { ...state.playback, ...action.payload.patch };
          break;
        case 'notifications':
          state.notifications = {
            ...state.notifications,
            ...action.payload.patch,
            push: {
              ...state.notifications.push,
              ...action.payload.patch.push,
            },
            email: {
              ...state.notifications.email,
              ...action.payload.patch.email,
            },
          };
          break;
      }
    },
    hydratePreferences: (_state, action: PayloadAction<PreferencesState>) =>
      action.payload,
  },
});

export const { setPreferenceSection, hydratePreferences } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
