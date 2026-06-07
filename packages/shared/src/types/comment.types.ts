import { z } from 'zod';
import {
  commentCreateSchema,
  commentUpdateSchema,
} from '../schemas/comment.schema.js';

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

export interface IComment {
  id: string;
  userId: string;
  videoId?: string;
  shortId?: string;
  parentId?: string;
  text: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
