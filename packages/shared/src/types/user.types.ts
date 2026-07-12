import { z } from 'zod';
import {
  userRegistrationSchema,
  userProfileUpdateSchema,
  usernameParamSchema,
  updatePreferencesSchema,
} from '../schemas/user.schema.js';
import { AUTH_PROVIDERS } from '../constants/auth.constants.js';
import { USER_ROLES, type ProfileContentType } from '../constants/user.constants.js';
import type { Theme, ViewMode } from '../constants/general.constants.js';

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export interface IUserPreferences {
  theme?: Theme;
  sidebarCollapsed?: boolean;
  profileViewMode?: Partial<Record<ProfileContentType, ViewMode>>;
}

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role: (typeof USER_ROLES)[number];
  authProviders: (typeof AUTH_PROVIDERS)[number][];
  isEmailVerified: boolean;
  preferences?: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublicProfile {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
}
