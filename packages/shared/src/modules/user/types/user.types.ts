import { z } from 'zod';
import {
  userRegistrationSchema,
  userProfileUpdateSchema,
  usernameParamSchema,
  basicProfileSchema,
  personalDetailsSchema,
  contactLinksSchema,
  bannerPresetSelectSchema,
} from '../schema/user.schema.js';
import { captureLocationSchema } from '../../location/location.schema.js';
import { AUTH_PROVIDERS } from '../../auth/auth.constants.js';
import {
  GENDER_OPTIONS,
  MODERATION_STATUS,
  PROFILE_CONTENT_TYPES,
  RELATIONSHIP_STATUSES,
  USER_ROLES,
  USER_STATUSES,
} from '../constants/user.constants.js';

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
export type BasicProfileInput = z.infer<typeof basicProfileSchema>;
export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type ContactLinksInput = z.infer<typeof contactLinksSchema>;
export type BannerPresetSelectInput = z.infer<typeof bannerPresetSelectSchema>;
export type CaptureLocationInput = z.infer<typeof captureLocationSchema>;
export type ProfileContentType = (typeof PROFILE_CONTENT_TYPES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];
export type GenderOption = (typeof GENDER_OPTIONS)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type ModerationStatus = (typeof MODERATION_STATUS)[number];

export interface IUserSocialLink {
  platform: string;
  url: string;
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
  bannerUrl?: string;
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
  deletionRequestedAt?: Date | null;
  deletionScheduledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublicProfile {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  followerCount: number;
  followingCount: number;
  isFollowedByViewer?: boolean;
}
