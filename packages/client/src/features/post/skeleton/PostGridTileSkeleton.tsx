import { POST_TILE_HEIGHT_PX } from '@network/shared';
import Skeleton from '../../../shared/ui/skeleton/Skeleton';
import { COL_CLASS, type ColCount } from '../../video/utils/videoGrid';

export const PostGridTileSkeleton = () => (
  <div
    style={{ height: POST_TILE_HEIGHT_PX }}
    className="flex flex-col w-full rounded-2xl border border-border bg-surface overflow-hidden"
  >
    <div className="p-3 sm:p-4 shrink-0 flex items-center gap-2.5">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-2.5 w-16 rounded" />
      </div>
    </div>
    <div className="flex-1 min-h-0 px-3 sm:px-4 pb-3 flex flex-col gap-2">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-[90%] rounded" />
      <Skeleton className="h-3 w-[70%] rounded" />
      <Skeleton className="flex-1 w-full rounded-xl mt-1" />
    </div>
  </div>
);

export const PostTileRowSkeleton = ({ cols }: { cols: ColCount }) => (
  <div className={`grid ${COL_CLASS[cols]} gap-4`}>
    {Array.from({ length: cols }).map((_, i) => (
      <PostGridTileSkeleton key={i} />
    ))}
  </div>
);

export const PostTileGridSkeleton = ({
  count,
  cols,
}: {
  count: number;
  cols: ColCount;
}) => {
  const rowCount = Math.max(1, Math.ceil(count / cols));

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rowCount }).map((_, i) => (
        <PostTileRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
};

export default PostGridTileSkeleton;
