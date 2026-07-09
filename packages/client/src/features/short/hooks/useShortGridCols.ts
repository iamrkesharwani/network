import { useEffect, useRef, useState } from 'react';
import type { ShortColCount } from '../utils/shortGrid';

const getColCount = (width: number): ShortColCount => {
  if (width >= 1100) return 6;
  if (width >= 800) return 4;
  if (width >= 500) return 3;
  return 2;
};

const getInitialWidth = (): number => {
  if (typeof document === 'undefined') return 0;
  const main = document.querySelector('main');
  return (main ?? document.documentElement).clientWidth;
};

export const useShortGridCols = (): ShortColCount => {
  const [cols, setCols] = useState<ShortColCount>(() =>
    getColCount(getInitialWidth())
  );
  const containerRef = useRef<Element | null>(null);

  useEffect(() => {
    const main = document.querySelector('main');
    containerRef.current = main;

    const target = main ?? document.documentElement;

    const obs = new ResizeObserver(([e]) => {
      setCols(getColCount(e.contentRect.width));
    });
    obs.observe(target);

    return () => obs.disconnect();
  }, []);

  return cols;
};
