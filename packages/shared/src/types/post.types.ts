import { z } from 'zod';
import {
  createPostSchema,
  postUpdateSchema,
  postFinaliseSchema,
  initiatePostVideoUploadSchema,
  confirmPostVideoUploadSchema,
  postFeedQuerySchema,
  postIdParamSchema,
} from '../schemas/post.schema.js';
import {
  POST_VISIBILITY,
  POST_STATUS,
  POST_MEDIA_TYPE,
} from '../constants/post.constants.js';
import type { ICreatorEvent } from './creator.types.js';

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostFinaliseInput = z.infer<typeof postFinaliseSchema>;
export type InitiatePostVideoUploadInput = z.infer<
  typeof initiatePostVideoUploadSchema
>;
export type ConfirmPostVideoUploadInput = z.infer<
  typeof confirmPostVideoUploadSchema
>;
export type PostFeedQuery = z.infer<typeof postFeedQuerySchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type PostVisibility = (typeof POST_VISIBILITY)[number];
export type PostStatus = (typeof POST_STATUS)[number];
export type PostMediaType = (typeof POST_MEDIA_TYPE)[number];

export interface IInitiatePostVideoUploadResult {
  postId: string;
  presignedUrl: string;
  storageKey: string;
}

export interface IPost {
  id: string;
  userId: string;
  text?: string;
  mediaType: PostMediaType;
  imageUrl?: string;
  providerVideoId?: string;
  playbackUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  status: PostStatus;
  errorMessage?: string;
  storageKey?: string;
  metricsRecorded?: boolean;
  tags: string[];
  visibility: PostVisibility;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPostAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface IPostResponse extends Omit<
  IPost,
  'userId' | 'providerVideoId' | 'storageKey' | 'metricsRecorded'
> {
  author: IPostAuthor;
}

export interface IPostActionResult {
  post: IPostResponse;
  creatorEvent: ICreatorEvent | null;
}
