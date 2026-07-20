import { z } from 'zod';
import { likeToggleSchema, likeStatusQuerySchema } from './like.schema.js';

export type LikeToggleInput = z.infer<typeof likeToggleSchema>;
export type LikeStatusQuery = z.infer<typeof likeStatusQuerySchema>;

export interface ILikeToggleResponse {
  liked: boolean;
  likesCount: number;
}
