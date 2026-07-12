import { useEffect, useState } from 'react';
import type { IShortResponse } from '@network/shared';
import {
  useGetUserShortsQuery,
  useDeleteShortMutation,
  useUpdateShortMutation,
} from '../../short/shortApi';
import ShortGrid from '../../short/pages/ShortGrid';
import ShortList from '../../short/pages/ShortList';
import ViewModeToggle from '../../../shared/ui/misc/ViewModeToggle';
import VisibilityFilter, {
  type VisibilityFilterValue,
} from './VisibilityFilter';
import { useProfileViewMode } from '../hooks/useProfileViewMode';

export interface ShortsTabPanelProps {
  username: string;
  isOwner: boolean;
}

const ShortsTabPanel = ({ username, isOwner }: ShortsTabPanelProps) => {
  const [viewMode, setViewMode] = useProfileViewMode('short');
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilterValue>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

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

  const [deleteShort] = useDeleteShortMutation();
  const [updateShort] = useUpdateShortMutation();

  const shorts = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleDelete = async (short: IShortResponse) => {
    await deleteShort(short.id).unwrap();
  };

  const handleToggleVisibility = async (short: IShortResponse) => {
    await updateShort({
      shortId: short.id,
      visibility: short.visibility === 'unlisted' ? 'public' : 'unlisted',
    }).unwrap();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {isOwner ? (
          <VisibilityFilter
            value={visibilityFilter}
            onChange={setVisibilityFilter}
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
    </div>
  );
};

export default ShortsTabPanel;
