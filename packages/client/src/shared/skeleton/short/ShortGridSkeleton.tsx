import { SHORT_COL_CLASS, type ShortColCount } from '../../utils/shortGrid';
import ShortCardSkeleton from './ShortCardSkeleton';

interface ShortGridSkeletonProps {
  count: number;
  cols: ShortColCount;
}

export const ShortGridSkeleton = ({ count, cols }: ShortGridSkeletonProps) => (
  <div className={`grid ${SHORT_COL_CLASS[cols]} gap-x-3 gap-y-5`}>
    {Array.from({ length: count }).map((_, i) => (
      <ShortCardSkeleton key={i} />
    ))}
  </div>
);

interface ShortRowSkeletonProps {
  cols: ShortColCount;
}

export const ShortRowSkeleton = ({ cols }: ShortRowSkeletonProps) => (
  <div className={`grid ${SHORT_COL_CLASS[cols]} gap-x-3`}>
    {Array.from({ length: cols }).map((_, i) => (
      <ShortCardSkeleton key={i} />
    ))}
  </div>
);
