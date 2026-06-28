import { useEffect, useRef, useState } from 'react';
import type { ShortColCount } from '../../../shared/utils/shortGrid';

const getColCount = (width: number): ShortColCount => {
  if (width >= 1100) return 6;
  if (width >= 800) return 4;
  if (width >= 500) return 3;
  return 2;
};

export const useShortGridCols = (): ShortColCount => {
  const [cols, setCols] = useState<ShortColCount>(2);
  const containerRef = useRef<Element | null>(null);

  useEffect(() => {
    const main = document.querySelector('main');
    containerRef.current = main;

    const target = main ?? document.documentElement;
    setCols(getColCount(target.clientWidth));

    const obs = new ResizeObserver(([e]) => {
      setCols(getColCount(e.contentRect.width));
    });
    obs.observe(target);

    return () => obs.disconnect();
  }, []);

  return cols;
};
