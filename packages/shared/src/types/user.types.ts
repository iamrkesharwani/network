import { z } from 'zod';
import {
  userRegistrationSchema,
  userProfileUpdateSchema,
  usernameParamSchema,
  basicProfileSchema,
  personalDetailsSchema,
  contactLinksSchema,
} from '../schemas/user.schema.js';
import { captureLocationSchema } from '../schemas/location.schema.js';
import { AUTH_PROVIDERS } from '../constants/auth.constants.js';
import {
  USER_ROLES,
  type GenderOption,
  type RelationshipStatus,
  type SocialPlatform,
  type UserStatus,
} from '../constants/user.constants.js';

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
export type BasicProfileInput = z.infer<typeof basicProfileSchema>;
export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type ContactLinksInput = z.infer<typeof contactLinksSchema>;
export type CaptureLocationInput = z.infer<typeof captureLocationSchema>;

export interface IUserSocialLink {
  platform: SocialPlatform;
  url: string;
  customLabel?: string;
}

export interface IUserPhone {
  dialCode: string;
  iso2?: string;
  number: string;
}

export interface IUserLocationEntry {
  lat: number;
  lng: number;
  capturedAt: Date;
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
  hasPassword: boolean;
  isEmailVerified: boolean;
  usernameChangedAt?: Date | null;
  dateOfBirth?: Date;
  gender?: GenderOption;
  genderSelfDescribe?: string;
  pronouns?: string[];
  relationshipStatus?: RelationshipStatus;
  location?: IUserLocationEntry[];
  website?: string;
  socialLinks?: IUserSocialLink[];
  phone?: IUserPhone;
  isMinor?: boolean;
  status: UserStatus;
  deactivatedAt?: Date | null;
  reactivateAt?: Date | null;
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
