import { useEffect, useState } from 'react';
import {
  MOBILE_MAX,
  TABLET_MAX,
  FEED_VIDEO_ROWS_PER_BLOCK_FIRST_MOBILE_PORTRAIT,
  FEED_VIDEO_ROWS_PER_BLOCK_MOBILE_PORTRAIT,
  FEED_SHORTS_PER_BLOCK_MOBILE_PORTRAIT,
  FEED_POSTS_PER_BLOCK_MOBILE_PORTRAIT,
  FEED_VIDEO_ROWS_PER_BLOCK_FIRST_COMPACT,
  FEED_VIDEO_ROWS_PER_BLOCK_COMPACT,
  FEED_SHORTS_PER_BLOCK_COMPACT,
  FEED_POSTS_PER_BLOCK_COMPACT,
  FEED_VIDEO_ROWS_PER_BLOCK_FIRST_TABLET_LANDSCAPE,
  FEED_VIDEO_ROWS_PER_BLOCK_TABLET_LANDSCAPE,
  FEED_SHORTS_PER_BLOCK_TABLET_LANDSCAPE,
  FEED_POSTS_PER_BLOCK_TABLET_LANDSCAPE,
  FEED_VIDEO_ROWS_PER_BLOCK_FIRST_DESKTOP,
  FEED_VIDEO_ROWS_PER_BLOCK_DESKTOP,
  FEED_SHORTS_PER_BLOCK_DESKTOP,
  FEED_POSTS_PER_BLOCK_DESKTOP,
  type FeedColumnCount,
  type FeedWidthMode,
} from '@network/shared';
import type { ShortColCount } from '../../short/utils/shortGrid';

export interface FeedColumnsResult {
  columns: FeedColumnCount;
  widthMode: FeedWidthMode;
  showChatRail: boolean;
  firstVideoBlockSize: number;
  videosPerBlock: number;
  shortsPerBlock: ShortColCount;
  postsPerBlock: number;
}

export const computeFeedColumns = (
  width: number,
  height: number,
  isChatOpen: boolean
): FeedColumnsResult => {
  const isMobile = width < MOBILE_MAX;
  const isLandscape = width >= height;

  if (isMobile && !isLandscape) {
    const columns: FeedColumnCount = 1;
    return {
      columns,
      widthMode: 'edge',
      showChatRail: false,
      firstVideoBlockSize:
        FEED_VIDEO_ROWS_PER_BLOCK_FIRST_MOBILE_PORTRAIT * columns,
      videosPerBlock: FEED_VIDEO_ROWS_PER_BLOCK_MOBILE_PORTRAIT * columns,
      shortsPerBlock: FEED_SHORTS_PER_BLOCK_MOBILE_PORTRAIT,
      postsPerBlock: FEED_POSTS_PER_BLOCK_MOBILE_PORTRAIT,
    };
  }

  if (isMobile && isLandscape) {
    const columns: FeedColumnCount = 2;
    return {
      columns,
      widthMode: 'full',
      showChatRail: false,
      firstVideoBlockSize: FEED_VIDEO_ROWS_PER_BLOCK_FIRST_COMPACT * columns,
      videosPerBlock: FEED_VIDEO_ROWS_PER_BLOCK_COMPACT * columns,
      shortsPerBlock: FEED_SHORTS_PER_BLOCK_COMPACT,
      postsPerBlock: FEED_POSTS_PER_BLOCK_COMPACT,
    };
  }

  const isTablet = width < TABLET_MAX;
  if (isTablet) {
    if (isLandscape) {
      const columns: FeedColumnCount = 3;
      return {
        columns,
        widthMode: 'full',
        showChatRail: false,
        firstVideoBlockSize:
          FEED_VIDEO_ROWS_PER_BLOCK_FIRST_TABLET_LANDSCAPE * columns,
        videosPerBlock: FEED_VIDEO_ROWS_PER_BLOCK_TABLET_LANDSCAPE * columns,
        shortsPerBlock: FEED_SHORTS_PER_BLOCK_TABLET_LANDSCAPE,
        postsPerBlock: FEED_POSTS_PER_BLOCK_TABLET_LANDSCAPE,
      };
    }

    const columns: FeedColumnCount = 2;
    return {
      columns,
      widthMode: 'full',
      showChatRail: false,
      firstVideoBlockSize: FEED_VIDEO_ROWS_PER_BLOCK_FIRST_COMPACT * columns,
      videosPerBlock: FEED_VIDEO_ROWS_PER_BLOCK_COMPACT * columns,
      shortsPerBlock: FEED_SHORTS_PER_BLOCK_COMPACT,
      postsPerBlock: FEED_POSTS_PER_BLOCK_COMPACT,
    };
  }

  const columns: FeedColumnCount = isChatOpen ? 2 : 3;
  return {
    columns,
    widthMode: 'full',
    showChatRail: isChatOpen,
    firstVideoBlockSize: FEED_VIDEO_ROWS_PER_BLOCK_FIRST_DESKTOP * columns,
    videosPerBlock: FEED_VIDEO_ROWS_PER_BLOCK_DESKTOP * columns,
    shortsPerBlock: FEED_SHORTS_PER_BLOCK_DESKTOP,
    postsPerBlock: FEED_POSTS_PER_BLOCK_DESKTOP,
  };
};

const getInitialDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
};

export const useFeedColumns = (isChatOpen: boolean): FeedColumnsResult => {
  const [dimensions, setDimensions] = useState(getInitialDimensions);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return computeFeedColumns(dimensions.width, dimensions.height, isChatOpen);
};
