import type { z } from 'zod';
import type { blockListQuerySchema } from './block.schema.js';

export type BlockListQuery = z.infer<typeof blockListQuerySchema>;

export interface IBlockedUserListItem {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  blockedAt: string;
}
