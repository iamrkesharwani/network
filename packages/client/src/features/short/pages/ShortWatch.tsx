import { useCallback, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useLiveShortsFeed } from '../../feed/hooks/useLiveShortsFeed';
import { useGetShortByIdQuery } from '../shortApi';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useShortLayoutMode } from '../hooks/useShortLayoutMode';
import { cn } from '../../../shared/utils/cn';
import ShortFeed from '../../player/variants/short/ShortFeed';
import ShortWatchDesktop from './ShortWatchDesktop';

const ShortWatch = () => {
  usePageTitle('Shorts');
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const { mode, compact } = useShortLayoutMode();
  const isMobileLayout = mode === 'mobile';

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
      <div
        className={cn(
          'flex items-center justify-center',
          isMobileLayout
            ? 'fixed inset-0 z-[60] bg-black'
            : 'h-[60vh] w-full'
        )}
      >
        <Loader2
          className={cn(
            'h-8 w-8 animate-spin',
            isMobileLayout ? 'text-white' : 'text-text-muted'
          )}
        />
      </div>
    );
  }

  if (feedIndex === -1 && !fallbackResponse?.data) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          isMobileLayout
            ? 'fixed inset-0 z-[60] bg-black text-white'
            : 'h-[60vh] w-full text-text-primary'
        )}
      >
        <p className="text-sm">This short couldn't be found.</p>
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium',
            isMobileLayout
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-surface-overlay hover:bg-surface-raised'
          )}
        >
          Back to feed
        </button>
      </div>
    );
  }

  if (!isMobileLayout) {
    return (
      <ShortWatchDesktop
        shorts={displayShorts}
        index={displayIndex}
        onIndexChange={handleIndexChange}
        compact={compact}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black">
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
