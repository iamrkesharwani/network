import { useEffect, useState } from 'react';
import { MOBILE_MAX, TABLET_MAX } from '@network/shared';
import { useMainWidth } from '../../../shared/hooks/useMainWidth';

export interface ShortLayoutMode {
  mode: 'mobile' | 'desktop';
  compact: boolean;
}

const getInitialHeight = (): number =>
  typeof window === 'undefined' ? 0 : window.innerHeight;

export const useShortLayoutMode = (): ShortLayoutMode => {
  const width = useMainWidth();
  const [height, setHeight] = useState<number>(getInitialHeight);

  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (width <= MOBILE_MAX) return { mode: 'mobile', compact: false };

  if (width <= TABLET_MAX) {
    return width >= height
      ? { mode: 'desktop', compact: true }
      : { mode: 'mobile', compact: false };
  }

  return { mode: 'desktop', compact: false };
};
