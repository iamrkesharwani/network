import { z } from 'zod';
import {
  createPostSchema,
  postUpdateSchema,
  postFeedQuerySchema,
  postIdParamSchema,
  postUserFeedQuerySchema,
} from '../schemas/post.schema.js';
import {
  POST_VISIBILITY,
  POST_STATUS,
  POST_MEDIA_TYPE,
} from '../constants/post.constants.js';
import type { ICreatorEvent } from './creator.types.js';
import type { ModerationStatus } from '../constants/moderation.constants.js';

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostFeedQuery = z.infer<typeof postFeedQuerySchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type PostUserFeedQuery = z.infer<typeof postUserFeedQuerySchema>;
export type PostVisibility = (typeof POST_VISIBILITY)[number];
export type PostStatus = (typeof POST_STATUS)[number];
export type PostMediaType = (typeof POST_MEDIA_TYPE)[number];

export interface IPost {
  id: string;
  userId: string;
  text?: string;
  mediaType: PostMediaType;
  imageUrls?: string[];
  status: PostStatus;
  tags: string[];
  visibility: PostVisibility;
  views: number;
  likes: number;
  deletedAt?: string | null;
  unlistedAt?: string | null;
  unlistedExpiryWarnedAt?: string | null;
  moderationStatus: ModerationStatus;
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
  'userId' | 'deletedAt' | 'unlistedExpiryWarnedAt'
> {
  author: IPostAuthor;
}

export interface IPostActionResult {
  post: IPostResponse;
  creatorEvent: ICreatorEvent | null;
}
