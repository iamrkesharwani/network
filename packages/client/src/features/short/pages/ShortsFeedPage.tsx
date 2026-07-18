import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES, type IShortResponse } from '@network/shared';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useLiveShortsFeed } from '../../feed/hooks/useLiveShortsFeed';
import ShortGrid from './ShortGrid';
import ShortTheaterModal from '../components/ShortTheaterModal';
import usePageTitle from '../../../shared/hooks/usePageTitle';

const ShortsFeedPage = () => {
  usePageTitle('Shorts');
  const navigate = useNavigate();
  const isMobileLayout = useIsMobileLayout();
  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);

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
    if (isMobileLayout) {
      navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id));
      return;
    }

    const index = shorts.findIndex((s) => s.id === short.id);
    if (index === -1) return;
    setTheaterIndex(index);
  };

  const handleTheaterNext = () => {
    setTheaterIndex((index) =>
      index === null ? index : Math.min(index + 1, shorts.length - 1)
    );
  };

  const handleTheaterPrev = () => {
    setTheaterIndex((index) =>
      index === null ? index : Math.max(index - 1, 0)
    );
  };

  return (
    <div>
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

      {theaterIndex !== null && (
        <ShortTheaterModal
          short={shorts[theaterIndex] ?? null}
          activeIndex={theaterIndex}
          total={shorts.length}
          onNext={handleTheaterNext}
          onPrev={handleTheaterPrev}
          onClose={() => setTheaterIndex(null)}
        />
      )}
    </div>
  );
};

export default ShortsFeedPage;
