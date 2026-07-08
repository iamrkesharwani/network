import type {
  IPostResponse,
  IShortResponse,
  IVideoResponse,
} from '@network/shared';

export type FeedBlock =
  | { type: 'shorts'; items: IShortResponse[]; startIndex: number }
  | { type: 'videos'; startVideo: number; endVideo: number; isLast: boolean }
  | { type: 'posts'; items: IPostResponse[]; startIndex: number };

export const buildFeedBlocks = (
  allShorts: IShortResponse[],
  allVideos: IVideoResponse[],
  allPosts: IPostResponse[],
  shortsPerBlock: number,
  videosPerBlock: number,
  postsPerBlock: number
) => {
  const totalVideoBlocks = Math.ceil(allVideos.length / videosPerBlock);
  const shortsInBlocks = totalVideoBlocks * shortsPerBlock;
  const remainingShorts = allShorts.slice(shortsInBlocks);
  const postsInBlocks = totalVideoBlocks * postsPerBlock;
  const remainingPosts = allPosts.slice(postsInBlocks);

  const blocks: FeedBlock[] = [];
  for (let i = 0; i < totalVideoBlocks; i++) {
    const shortsStart = i * shortsPerBlock;
    blocks.push({
      type: 'shorts',
      items: allShorts.slice(shortsStart, shortsStart + shortsPerBlock),
      startIndex: shortsStart,
    });
    blocks.push({
      type: 'videos',
      startVideo: i * videosPerBlock,
      endVideo: (i + 1) * videosPerBlock,
      isLast: i === totalVideoBlocks - 1,
    });

    const postsStart = i * postsPerBlock;
    blocks.push({
      type: 'posts',
      items: allPosts.slice(postsStart, postsStart + postsPerBlock),
      startIndex: postsStart,
    });
  }

  return {
    blocks,
    remainingShorts,
    shortsInBlocks,
    remainingPosts,
    postsInBlocks,
  };
};
