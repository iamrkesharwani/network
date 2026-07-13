import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES, type IShortResponse } from '@network/shared';
import {
  useGetUserShortsQuery,
  useDeleteShortMutation,
  useUpdateShortMutation,
  useGetUserVisibilityCountsQuery,
} from '../../short/shortApi';
import ShortGrid from '../../short/pages/ShortGrid';
import ShortList from '../../short/pages/ShortList';
import ShortTheaterModal from '../../short/components/ShortTheaterModal';
import ViewModeToggle from '../../../shared/ui/misc/ViewModeToggle';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import VisibilityFilter, {
  type VisibilityFilterValue,
} from './VisibilityFilter';
import ProcessingShelf from './ProcessingShelf';
import { useProfileViewMode } from '../hooks/useProfileViewMode';

export interface ShortsTabPanelProps {
  username: string;
  isOwner: boolean;
}

const ShortsTabPanel = ({ username, isOwner }: ShortsTabPanelProps) => {
  const navigate = useNavigate();
  const isMobileLayout = useIsMobileLayout();
  const [viewMode, setViewMode] = useProfileViewMode('short');
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilterValue>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);

  useEffect(() => {
    setCursor(undefined);
  }, [visibilityFilter, username]);

  const isFirstPage = cursor === undefined;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetUserShortsQuery({
      username,
      limit: 20,
      ...(cursor !== undefined && { cursor }),
      ...(isOwner &&
        visibilityFilter !== 'all' && { visibility: visibilityFilter }),
    });
  const { data: visibilityCounts } = useGetUserVisibilityCountsQuery(username, {
    skip: !isOwner,
  });

  const [deleteShort] = useDeleteShortMutation();
  const [updateShort] = useUpdateShortMutation();

  const shorts = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;
  const processingShorts = isOwner
    ? shorts.filter((short) => short.status !== 'READY')
    : [];

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleDelete = async (short: IShortResponse) => {
    await deleteShort(short.id).unwrap();
  };

  const handleDeleteById = async (shortId: string) => {
    await deleteShort(shortId).unwrap();
  };

  const handleToggleVisibility = async (short: IShortResponse) => {
    await updateShort({
      shortId: short.id,
      visibility: short.visibility === 'unlisted' ? 'public' : 'unlisted',
    }).unwrap();
  };

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
    setTheaterIndex((index) => (index === null ? index : Math.max(index - 1, 0)));
  };

  return (
    <div>
      {isOwner && (
        <ProcessingShelf items={processingShorts} onDelete={handleDeleteById} />
      )}

      <div className="flex items-center justify-between mb-4">
        {isOwner ? (
          <VisibilityFilter
            value={visibilityFilter}
            onChange={setVisibilityFilter}
            counts={visibilityCounts?.data}
          />
        ) : (
          <span />
        )}
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === 'grid' ? (
        <ShortGrid
          shorts={shorts}
          isLoading={isLoading && isFirstPage}
          isFetchingNextPage={isFetching && !isFirstPage}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          onThumbnailClick={handleThumbnailClick}
          onRetry={refetch}
          isOwner={isOwner}
          isError={isError}
        />
      ) : (
        <ShortList
          shorts={shorts}
          isLoading={isLoading && isFirstPage}
          isFetchingNextPage={isFetching && !isFirstPage}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          onRetry={refetch}
          isOwner={isOwner}
          isError={isError}
        />
      )}

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

export default ShortsTabPanel;
