import { useMainWidth } from '../../../shared/hooks/useMainWidth';
import type { ColCount } from '../utils/videoGrid';

export const getColCount = (width: number): ColCount => {
  if (width >= 900) return 4;
  if (width >= 500) return 2;
  return 1;
};

export const useGridCols = (): ColCount => {
  const width = useMainWidth();
  return getColCount(width);
};
