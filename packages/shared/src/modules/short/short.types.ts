import { z } from 'zod';
import {
  shortUploadSchema,
  shortUpdateSchema,
  initiateShortUploadSchema,
  confirmShortUploadSchema,
  shortFeedQuerySchema,
  shortIdParamSchema,
  shortUserFeedQuerySchema,
} from './short.schema.js';
import { SHORT_VISIBILITY, SHORT_STATUS } from './short.constants.js';
import type { ICreatorEvent } from '../creator/creator.types.js';
import type { ModerationStatus } from '../user/types/user.types.js';

export type ShortUploadInput = z.infer<typeof shortUploadSchema>;
export type ShortUpdateInput = z.infer<typeof shortUpdateSchema>;
export type InitiateShortUploadInput = z.infer<
  typeof initiateShortUploadSchema
>;
export type ConfirmShortUploadInput = z.infer<typeof confirmShortUploadSchema>;
export type ShortFeedQuery = z.infer<typeof shortFeedQuerySchema>;
export type ShortIdParam = z.infer<typeof shortIdParamSchema>;
export type ShortUserFeedQuery = z.infer<typeof shortUserFeedQuerySchema>;
export type ShortVisibility = (typeof SHORT_VISIBILITY)[number];
export type ShortStatus = (typeof SHORT_STATUS)[number];

export interface IInitiateShortUploadResult {
  shortId: string;
  presignedUrl: string;
  storageKey: string;
}

export interface IShort {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  providerVideoId?: string;
  playbackUrl?: string;
  status: ShortStatus;
  errorMessage?: string;
  progress?: number;
  storageKey?: string;
  metricsRecorded?: boolean;
  tags: string[];
  visibility: ShortVisibility;
  views: number;
  likes: number;
  duration: number;
  deletedAt?: string | null;
  unlistedAt?: string | null;
  unlistedExpiryWarnedAt?: string | null;
  moderationStatus: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IShortAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface IShortResponse extends Omit<
  IShort,
  | 'userId'
  | 'providerVideoId'
  | 'storageKey'
  | 'metricsRecorded'
  | 'deletedAt'
  | 'unlistedExpiryWarnedAt'
> {
  author: IShortAuthor;
}

export interface IShortActionResult {
  short: IShortResponse;
  creatorEvent: ICreatorEvent | null;
}
