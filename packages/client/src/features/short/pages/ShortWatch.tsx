import { useCallback, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useLiveShortsFeed } from '../../feed/hooks/useLiveShortsFeed';
import { useGetShortByIdQuery } from '../shortApi';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import ShortFeed from '../../player/variants/short/ShortFeed';

const ShortWatch = () => {
  usePageTitle('Shorts');
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  const { items: shorts, hasNextPage, loadMore } = useLiveShortsFeed();

  const feedIndex = useMemo(
    () => shorts.findIndex((short) => short.id === shortId),
    [shorts, shortId]
  );

  const { data: fallbackResponse, isLoading: isFallbackLoading } =
    useGetShortByIdQuery(shortId ?? '', { skip: !shortId || feedIndex !== -1 });

  const displayShorts = useMemo(() => {
    if (feedIndex !== -1) return shorts;
    return fallbackResponse?.data ? [fallbackResponse.data, ...shorts] : shorts;
  }, [feedIndex, shorts, fallbackResponse]);

  const displayIndex = feedIndex === -1 ? 0 : feedIndex;

  const handleIndexChange = useCallback(
    (index: number) => {
      const short = displayShorts[index];
      if (short) {
        navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id), {
          replace: true,
        });
      }
    },
    [displayShorts, navigate]
  );

  const handleBack = useCallback(() => {
    navigate(CLIENT_ROUTES.FEED);
  }, [navigate]);

  if (!shortId) {
    return <Navigate to={CLIENT_ROUTES.FEED} replace />;
  }

  if (feedIndex === -1 && isFallbackLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (feedIndex === -1 && !fallbackResponse?.data) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-black text-white">
        <p className="text-sm">This short couldn't be found.</p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium hover:bg-white/20"
        >
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full bg-black">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="absolute top-4 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <ShortFeed
        shorts={displayShorts}
        initialIndex={displayIndex}
        onIndexChange={handleIndexChange}
        onLoadMore={loadMore}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export default ShortWatch;
