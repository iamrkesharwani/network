import { useEffect, useRef, useState } from 'react';
import type { ColCount } from '../../../shared/utils/videoGrid';

const getColCount = (width: number): ColCount => {
  if (width >= 900) return 4;
  if (width >= 500) return 2;
  return 1;
};

const getInitialWidth = (): number => {
  if (typeof document === 'undefined') return 0;
  const main = document.querySelector('main');
  return (main ?? document.documentElement).clientWidth;
};

export const useGridCols = (): ColCount => {
  const [cols, setCols] = useState<ColCount>(() =>
    getColCount(getInitialWidth())
  );
  const containerRef = useRef<Element | null>(null);

  useEffect(() => {
    const main = document.querySelector('main');
    containerRef.current = main;

    const target = main ?? document.documentElement;

    const obs = new ResizeObserver(([e]) =>
      setCols(getColCount(e.contentRect.width))
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  return cols;
};
