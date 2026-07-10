import { useEffect, useState } from 'react';
import { MOBILE_MAX, TABLET_MAX } from '@network/shared';

export type FeedColumnCount = 1 | 2 | 3 | 4;
export type FeedWidthMode = 'full' | 'edge';

export interface FeedColumnsResult {
  columns: FeedColumnCount;
  widthMode: FeedWidthMode;
  showChatRail: boolean;
}

export const computeFeedColumns = (
  width: number,
  height: number
): FeedColumnsResult => {
  const isMobile = width < MOBILE_MAX;
  const isLandscape = width >= height;

  if (isMobile && !isLandscape) {
    return { columns: 1, widthMode: 'edge', showChatRail: false };
  }

  if (isMobile && isLandscape) {
    return { columns: 2, widthMode: 'full', showChatRail: false };
  }

  const isTablet = width < TABLET_MAX;
  if (isTablet) {
    return {
      columns: isLandscape ? 3 : 2,
      widthMode: 'full',
      showChatRail: false,
    };
  }

  return { columns: 4, widthMode: 'full', showChatRail: true };
};

const getInitialDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
};

export const useFeedColumns = (): FeedColumnsResult => {
  const [dimensions, setDimensions] = useState(getInitialDimensions);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return computeFeedColumns(dimensions.width, dimensions.height);
};
