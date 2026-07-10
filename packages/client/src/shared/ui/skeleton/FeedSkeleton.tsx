import { useFeedColumns } from '../../../features/feed/hooks/useFeedColumns';
import FeedSkeletonContent from '../../../features/feed/skeleton/FeedSkeleton';

const isChatOpen = false;

const FeedSkeleton = () => {
  const { columns, firstVideoBlockSize, videosPerBlock, shortsPerBlock } =
    useFeedColumns(isChatOpen);

  return (
    <FeedSkeletonContent
      columns={columns}
      firstVideoBlockSize={firstVideoBlockSize}
      videosPerBlock={videosPerBlock}
      shortsPerBlock={shortsPerBlock}
    />
  );
};

export default FeedSkeleton;
