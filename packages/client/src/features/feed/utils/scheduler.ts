import { FEED_MIX_RATIO, type FeedBlockType } from '@network/shared';

const WEIGHTS: Record<FeedBlockType, number> = {
  video: FEED_MIX_RATIO.video,
  short: FEED_MIX_RATIO.short,
  post: FEED_MIX_RATIO.post,
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
const BLOCK_TYPES = Object.keys(WEIGHTS) as FeedBlockType[];

export const createScheduler = () => {
  const current: Record<FeedBlockType, number> = {
    video: 0,
    short: 0,
    post: 0,
  };

  return function next(
    unavailable?: ReadonlySet<FeedBlockType>
  ): FeedBlockType | null {
    let picked: FeedBlockType | null = null;
    let max = -Infinity;

    for (const type of BLOCK_TYPES) {
      current[type] += WEIGHTS[type];
      if (unavailable?.has(type)) continue;
      if (current[type] > max) {
        max = current[type];
        picked = type;
      }
    }

    if (picked !== null) current[picked] -= TOTAL_WEIGHT;
    return picked;
  };
};
