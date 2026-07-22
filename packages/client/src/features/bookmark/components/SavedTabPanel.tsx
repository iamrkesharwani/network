import { useState } from 'react';
import type { IBookmarkResponse } from '@network/shared';
import SavedList from './SavedList';
import {
  useGetBookmarksQuery,
  useToggleBookmarkMutation,
} from '../../engagement/bookmarkApi';

const SavedTabPanel = () => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);

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

export default SavedTabPanel;
