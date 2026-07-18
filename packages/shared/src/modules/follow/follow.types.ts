import { z } from 'zod';
import { followListQuerySchema } from './follow.schema.js';

export type FollowListQuery = z.infer<typeof followListQuerySchema>;

export interface IFollowRelation {
  id: string;
  followerId: string;
  followeeId: string;
  createdAt: string;
}

export interface IFollowCounts {
  followerCount: number;
  followingCount: number;
}

export interface IFollowListItem {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  isFollowedByViewer?: boolean;
}
