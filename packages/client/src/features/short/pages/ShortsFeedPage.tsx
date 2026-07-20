import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES, type IShortResponse } from '@network/shared';
import { useLiveShortsFeed } from '../../feed/hooks/useLiveShortsFeed';
import ShortGrid from './ShortGrid';
import usePageTitle from '../../../shared/hooks/usePageTitle';

const ShortsFeedPage = () => {
  usePageTitle('Shorts');
  const navigate = useNavigate();

  const {
    items: shorts,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  } = useLiveShortsFeed();

  const handleThumbnailClick = (short: IShortResponse) => {
    navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id));
  };

  return (
    <ShortGrid
      shorts={shorts}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onLoadMore={loadMore}
      onThumbnailClick={handleThumbnailClick}
      onRetry={retry}
      isError={isError}
    />
  );
};

export default ShortsFeedPage;
