import { z } from 'zod';
import {
  createCommentSchema,
  updateCommentSchema,
  commentListQuerySchema,
  commentIdParamSchema,
} from './comment.schema.js';
import type { ContentType } from '../../core/contentRef/contentRef.types.js';
import type { ModerationStatus } from '../user/types/user.types.js';

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentListQuery = z.infer<typeof commentListQuerySchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;

export interface IComment {
  id: string;
  userId: string;
  contentType: ContentType;
  contentId: string;
  parentCommentId?: string | null;
  text: string;
  likes: number;
  repliesCount: number;
  edited: boolean;
  deletedAt?: string | null;
  moderationStatus: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface ICommentResponse
  extends Omit<IComment, 'userId' | 'deletedAt'> {
  author: ICommentAuthor;
  isDeleted: boolean;
}
