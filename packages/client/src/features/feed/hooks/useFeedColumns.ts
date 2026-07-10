import { useEffect, useState } from 'react';
import {
  MOBILE_MAX,
  TABLET_MAX,
  FEED_VIDEOS_PER_BLOCK_FIRST_MOBILE_PORTRAIT,
  FEED_VIDEOS_PER_BLOCK_MOBILE_PORTRAIT,
  FEED_SHORTS_PER_BLOCK_MOBILE_PORTRAIT,
  FEED_VIDEOS_PER_BLOCK_FIRST_COMPACT,
  FEED_VIDEOS_PER_BLOCK_COMPACT,
  FEED_SHORTS_PER_BLOCK_COMPACT,
  FEED_VIDEOS_PER_BLOCK_FIRST_TABLET_LANDSCAPE,
  FEED_VIDEOS_PER_BLOCK_TABLET_LANDSCAPE,
  FEED_SHORTS_PER_BLOCK_TABLET_LANDSCAPE,
  FEED_VIDEOS_PER_BLOCK_FIRST_DESKTOP,
  FEED_VIDEOS_PER_BLOCK_DESKTOP,
  FEED_SHORTS_PER_BLOCK_DESKTOP,
} from '@network/shared';
import type { ShortColCount } from '../../short/utils/shortGrid';

export type FeedColumnCount = 1 | 2 | 3 | 4;
export type FeedWidthMode = 'full' | 'edge';

export interface FeedColumnsResult {
  columns: FeedColumnCount;
  widthMode: FeedWidthMode;
  showChatRail: boolean;
  firstVideoBlockSize: number;
  videosPerBlock: number;
  shortsPerBlock: ShortColCount;
}

export const computeFeedColumns = (
  width: number,
  height: number,
  isChatOpen: boolean
): FeedColumnsResult => {
  const isMobile = width < MOBILE_MAX;
  const isLandscape = width >= height;

  if (isMobile && !isLandscape) {
    return {
      columns: 1,
      widthMode: 'edge',
      showChatRail: false,
      firstVideoBlockSize: FEED_VIDEOS_PER_BLOCK_FIRST_MOBILE_PORTRAIT,
      videosPerBlock: FEED_VIDEOS_PER_BLOCK_MOBILE_PORTRAIT,
      shortsPerBlock: FEED_SHORTS_PER_BLOCK_MOBILE_PORTRAIT,
    };
  }

  if (isMobile && isLandscape) {
    return {
      columns: 2,
      widthMode: 'full',
      showChatRail: false,
      firstVideoBlockSize: FEED_VIDEOS_PER_BLOCK_FIRST_COMPACT,
      videosPerBlock: FEED_VIDEOS_PER_BLOCK_COMPACT,
      shortsPerBlock: FEED_SHORTS_PER_BLOCK_COMPACT,
    };
  }

  const isTablet = width < TABLET_MAX;
  if (isTablet) {
    if (isLandscape) {
      return {
        columns: 3,
        widthMode: 'full',
        showChatRail: false,
        firstVideoBlockSize: FEED_VIDEOS_PER_BLOCK_FIRST_TABLET_LANDSCAPE,
        videosPerBlock: FEED_VIDEOS_PER_BLOCK_TABLET_LANDSCAPE,
        shortsPerBlock: FEED_SHORTS_PER_BLOCK_TABLET_LANDSCAPE,
      };
    }

    return {
      columns: 2,
      widthMode: 'full',
      showChatRail: false,
      firstVideoBlockSize: FEED_VIDEOS_PER_BLOCK_FIRST_COMPACT,
      videosPerBlock: FEED_VIDEOS_PER_BLOCK_COMPACT,
      shortsPerBlock: FEED_SHORTS_PER_BLOCK_COMPACT,
    };
  }

  return {
    columns: isChatOpen ? 3 : 4,
    widthMode: 'full',
    showChatRail: isChatOpen,
    firstVideoBlockSize: FEED_VIDEOS_PER_BLOCK_FIRST_DESKTOP,
    videosPerBlock: FEED_VIDEOS_PER_BLOCK_DESKTOP,
    shortsPerBlock: FEED_SHORTS_PER_BLOCK_DESKTOP,
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
