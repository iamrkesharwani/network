import { MOBILE_MAX, TABLET_MAX } from '@network/shared';
import { useEffect, useState } from 'react';

export type FeedDeviceTier = 'mobile' | 'tablet' | 'desktop';
export type FeedOrientation = 'portrait' | 'landscape';

export interface FeedLayout {
  tier: FeedDeviceTier;
  orientation: FeedOrientation;
}

const getTier = (width: number): FeedDeviceTier => {
  if (width < MOBILE_MAX) return 'mobile';
  if (width < TABLET_MAX) return 'tablet';
  return 'desktop';
};

const getOrientation = (width: number, height: number): FeedOrientation => {
  return width > height ? 'landscape' : 'portrait';
};

const computeLayout = (): FeedLayout => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return { tier: getTier(width), orientation: getOrientation(width, height) };
};

export const useFeedLayout = (): FeedLayout => {
  const [layout, setLayout] = useState<FeedLayout>(() =>
    typeof window === 'undefined'
      ? { tier: 'desktop', orientation: 'landscape' }
      : computeLayout()
  );

  useEffect(() => {
    const handleResize = () => setLayout(computeLayout());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return layout;
};
