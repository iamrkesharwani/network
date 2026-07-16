import { z } from 'zod';
import {
  userRegistrationSchema,
  userProfileUpdateSchema,
  usernameParamSchema,
} from '../schemas/user.schema.js';
import { AUTH_PROVIDERS } from '../constants/auth.constants.js';
import { USER_ROLES } from '../constants/user.constants.js';

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;

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
