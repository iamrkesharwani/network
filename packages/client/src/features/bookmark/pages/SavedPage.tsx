import { useState } from 'react';
import type { IBookmarkResponse } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import SavedList from '../components/SavedList';
import {
  useGetBookmarksQuery,
  useToggleBookmarkMutation,
} from '../../engagement/bookmarkApi';

const SavedPage = () => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  usePageTitle('Saved');

  const isFirstPage = cursor === undefined;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetBookmarksQuery({
      limit: 20,
      ...(cursor !== undefined && { cursor }),
    });

  const [toggleBookmark] = useToggleBookmarkMutation();

  const entries = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleRemove = async (entry: IBookmarkResponse) => {
    await toggleBookmark({
      contentType: entry.contentType,
      contentId: entry.content.id,
    }).unwrap();
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Saved</h1>

      <SavedList
        entries={entries}
        isLoading={isLoading && isFirstPage}
        isFetchingNextPage={isFetching && !isFirstPage}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        onRemove={handleRemove}
        onRetry={refetch}
        isError={isError}
      />
    </div>
  );
};

export default SavedPage;
