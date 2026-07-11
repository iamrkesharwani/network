import { useEffect, useState } from 'react';
import type { IPostResponse } from '@network/shared';
import {
  useGetUserPostsQuery,
  useDeletePostMutation,
  useUpdatePostMutation,
} from '../../post/postApi';
import PostGrid from '../../post/pages/PostGrid';
import PostList from '../../post/pages/PostList';
import ViewModeToggle from '../../../shared/ui/ViewModeToggle';
import VisibilityFilter, {
  type VisibilityFilterValue,
} from './VisibilityFilter';
import { useProfileViewMode } from '../hooks/useProfileViewMode';

export interface PostsTabPanelProps {
  username: string;
  isOwner: boolean;
}

const PostsTabPanel = ({ username, isOwner }: PostsTabPanelProps) => {
  const [viewMode, setViewMode] = useProfileViewMode('post');
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilterValue>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    setCursor(undefined);
  }, [visibilityFilter, username]);

  const isFirstPage = cursor === undefined;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetUserPostsQuery({
      username,
      limit: 20,
      ...(cursor !== undefined && { cursor }),
      ...(isOwner &&
        visibilityFilter !== 'all' && { visibility: visibilityFilter }),
    });

  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();

  const posts = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleDelete = async (post: IPostResponse) => {
    await deletePost(post.id).unwrap();
  };

  const handleToggleVisibility = async (post: IPostResponse) => {
    await updatePost({
      postId: post.id,
      visibility: post.visibility === 'unlisted' ? 'public' : 'unlisted',
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
        <PostGrid
          posts={posts}
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
        <PostList
          posts={posts}
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

export default PostsTabPanel;
