import type { IMixedFeedBatch } from '@network/shared';
import { composeMixedBatch, type MixCursors } from './mix.service.js';

export const getUnifiedFeed = async (
  cursors: MixCursors,
  limit: number,
  viewerId?: string
): Promise<IMixedFeedBatch> =>
  composeMixedBatch(cursors, limit, { mode: 'global' }, viewerId);
