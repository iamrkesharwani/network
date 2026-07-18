import type { z } from 'zod';
import type { preferencesPatchSchema } from './preferences.schema.js';
import type { ProfileContentType } from '../user/types/user.types.js';
import type { PREFERENCES_NOTIFICATION_CATEGORIES } from './preferences.constants.js';
import type { Theme, ViewMode } from '../general/types/general.types.js';

export type PreferencesPatchInput = z.infer<typeof preferencesPatchSchema>;

export type PreferencesNotificationCategory =
  (typeof PREFERENCES_NOTIFICATION_CATEGORIES)[number];

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
