import FeedSkeletonDesktop from '../feed/desktop/FeedSkeletonDesktop';
import FeedSkeletonTabletLandscape from '../feed/tablet/FeedSkeletonTabletLandscape';
import FeedSkeletonTabletPortrait from '../feed/tablet/FeedSkeletonTabletPortrait';
import FeedSkeletonMobilePortrait from '../feed/mobile/FeedSkeletonMobilePortrait';
import FeedSkeletonMobileLandscape from '../feed/mobile/FeedSkeletonMobileLandscape';
import { useFeedLayout } from '../../../features/feed/hooks/useFeedLayout';

const FeedSkeleton = () => {
  const { tier, orientation } = useFeedLayout();

  if (tier === 'desktop') {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <FeedSkeletonDesktop />
      </div>
    );
  }

  if (tier === 'tablet') {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        {orientation === 'landscape' ? (
          <FeedSkeletonTabletLandscape />
        ) : (
          <FeedSkeletonTabletPortrait />
        )}
      </div>
    );
  }

  return orientation === 'landscape' ? (
    <FeedSkeletonMobileLandscape />
  ) : (
    <FeedSkeletonMobilePortrait />
  );
};

export default FeedSkeleton;
