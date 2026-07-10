import { z } from 'zod';
import {
  videoUpdateSchema,
  videoUploadSchema,
  initiateVideoUploadSchema,
  confirmVideoUploadSchema,
  videoFeedQuerySchema,
  videoIdParamSchema,
} from '../schemas/video.schema.js';
import {
  VIDEO_CATEGORIES,
  VIDEO_VISIBILITY,
  VIDEO_STATUS,
} from '../constants/video.constants.js';
import type { ICreatorEvent } from './creator.types.js';

export type VideoUploadInput = z.infer<typeof videoUploadSchema>;
export type VideoUpdateInput = z.infer<typeof videoUpdateSchema>;
export type InitiateVideoUploadInput = z.infer<
  typeof initiateVideoUploadSchema
>;
export type ConfirmVideoUploadInput = z.infer<typeof confirmVideoUploadSchema>;
export type VideoFeedQuery = z.infer<typeof videoFeedQuerySchema>;
export type VideoIdParam = z.infer<typeof videoIdParamSchema>;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];
export type VideoVisibility = (typeof VIDEO_VISIBILITY)[number];
export type VideoStatus = (typeof VIDEO_STATUS)[number];

export interface IInitiateVideoUploadResult {
  videoId: string;
  presignedUrl: string;
  storageKey: string;
}

export interface IVideo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  providerVideoId?: string;
  playbackUrl?: string;
  status: VideoStatus;
  errorMessage?: string;
  storageKey?: string;
  metricsRecorded?: boolean;
  category: VideoCategory;
  tags: string[];
  visibility: VideoVisibility;
  views: number;
  likes: number;
  duration: number;
  deletedAt?: Date | string | null;
  unlistedAt?: Date | string | null;
  unlistedExpiryWarnedAt?: Date | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IVideoAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface IVideoResponse extends Omit<
  IVideo,
  | 'userId'
  | 'providerVideoId'
  | 'storageKey'
  | 'metricsRecorded'
  | 'deletedAt'
  | 'unlistedExpiryWarnedAt'
> {
  author: IVideoAuthor;
}

export interface IVideoActionResult {
  video: IVideoResponse;
  creatorEvent: ICreatorEvent | null;
}
