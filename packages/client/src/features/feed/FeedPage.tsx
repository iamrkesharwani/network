import usePageTitle from '../../shared/hooks/usePageTitle';
import { useFeedLayout } from './hooks/useFeedLayout';
import FeedDesktop from './desktop/FeedDesktop';
import FeedTabletLandscape from './tablet/FeedTabletLandscape';
import FeedTabletPortrait from './tablet/FeedTabletPortrait';
import FeedMobilePortrait from './mobile/FeedMobilePortrait';
import FeedMobileLandscape from './mobile/FeedMobileLandscape';

const FeedPage = () => {
  usePageTitle('Feed');
  const { tier, orientation } = useFeedLayout();

  if (tier === 'desktop') {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        <FeedDesktop />
      </div>
    );
  }

  if (tier === 'tablet') {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        {orientation === 'landscape' ? (
          <FeedTabletLandscape />
        ) : (
          <FeedTabletPortrait />
        )}
      </div>
    );
  }

  return orientation === 'landscape' ? (
    <FeedMobileLandscape />
  ) : (
    <FeedMobilePortrait />
  );
};

export default FeedPage;
