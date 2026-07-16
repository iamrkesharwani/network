import type { z } from 'zod';
import type { preferencesPatchSchema } from '../schemas/preferences.schema.js';
import type { Theme, ViewMode } from '../constants/general.constants.js';
import type { ProfileContentType } from '../constants/user.constants.js';
import type { PreferencesNotificationCategory } from '../constants/preferences.constants.js';

export type PreferencesPatchInput = z.infer<typeof preferencesPatchSchema>;

export interface IPreferencesAppearance {
  theme?: Theme;
  sidebarCollapsed?: boolean;
}

export interface IPreferencesLayout {
  profileViewMode?: Partial<Record<ProfileContentType, ViewMode>>;
}

export interface IPreferencesPlayback {
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  autoplayNext?: boolean;
  captionsDefaultOn?: boolean;
  captionsLanguage?: string;
}

export type IPreferencesNotificationChannel = Partial<
  Record<PreferencesNotificationCategory, boolean>
>;

export interface IPreferencesNotifications {
  push?: IPreferencesNotificationChannel;
  email?: IPreferencesNotificationChannel;
}

export interface IPreferences {
  userId: string;
  version: number;
  updatedAt: Date | null;
  appearance: IPreferencesAppearance;
  layout: IPreferencesLayout;
  playback: IPreferencesPlayback;
  notifications: IPreferencesNotifications;
}
