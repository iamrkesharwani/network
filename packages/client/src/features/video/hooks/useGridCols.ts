import { useEffect, useState } from 'react';
import type { ColCount } from '../../../shared/utils/grid';

const getColCount = (width: number): ColCount => {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
};

export const useGridCols = (): ColCount => {
  const [cols, setCols] = useState<ColCount>(() =>
    getColCount(window.innerWidth)
  );

  useEffect(() => {
    const obs = new ResizeObserver(([e]) =>
      setCols(getColCount(e.contentRect.width))
    );
    obs.observe(document.documentElement);
    return () => obs.disconnect();
  }, []);

  return cols;
};
