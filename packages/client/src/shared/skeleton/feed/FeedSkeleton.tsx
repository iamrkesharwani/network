import FeedSkeletonDesktop from './desktop/FeedSkeletonDesktop';
import FeedSkeletonTabletLandscape from './tablet/FeedSkeletonTabletLandscape';
import FeedSkeletonTabletPortrait from './tablet/FeedSkeletonTabletPortrait';
import FeedSkeletonMobilePortrait from './mobile/FeedSkeletonMobilePortrait';
import FeedSkeletonMobileLandscape from './mobile/FeedSkeletonMobileLandscape';
import { useFeedLayout } from '../../../features/feed/hooks/useFeedLayout';

const FeedSkeleton = () => {
  const { tier, orientation } = useFeedLayout();

  if (tier === 'desktop') {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        <FeedSkeletonDesktop />
      </div>
    );
  }

  if (tier === 'tablet') {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
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
