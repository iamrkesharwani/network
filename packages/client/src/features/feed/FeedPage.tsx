import FeedDesktop from './FeedDesktop';
import FeedTablet from './FeedTablet';
import FeedMobile from './FeedMobile';
import usePageTitle from '../../shared/hooks/usePageTitle';

const FeedPage = () => {
  usePageTitle('Feed');

  return (
    <>
      <div className="md:hidden">
        <FeedMobile />
      </div>

      <div className="hidden md:block xl:hidden -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        <FeedTablet />
      </div>

      <div className="hidden xl:block -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        <FeedDesktop />
      </div>
    </>
  );
};

export default FeedPage;
