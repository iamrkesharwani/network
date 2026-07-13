import { useEffect, useState } from 'react';
import type { IVideoResponse } from '@network/shared';
import {
  useGetUserVideosQuery,
  useDeleteVideoMutation,
  useUpdateVideoMutation,
  useGetUserVisibilityCountsQuery,
} from '../../video/videoApi';
import VideoGrid from '../../video/pages/VideoGrid';
import VideoList from '../../video/pages/VideoList';
import ViewModeToggle from '../../../shared/ui/misc/ViewModeToggle';
import VisibilityFilter, {
  type VisibilityFilterValue,
} from './VisibilityFilter';
import ProcessingShelf from './ProcessingShelf';
import { useProfileViewMode } from '../hooks/useProfileViewMode';

export interface VideosTabPanelProps {
  username: string;
  isOwner: boolean;
}

const VideosTabPanel = ({ username, isOwner }: VideosTabPanelProps) => {
  const [viewMode, setViewMode] = useProfileViewMode('video');
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilterValue>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    setCursor(undefined);
  }, [visibilityFilter, username]);

  const isFirstPage = cursor === undefined;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetUserVideosQuery({
      username,
      limit: 20,
      ...(cursor !== undefined && { cursor }),
      ...(isOwner &&
        visibilityFilter !== 'all' && { visibility: visibilityFilter }),
    });
  const { data: visibilityCounts } = useGetUserVisibilityCountsQuery(username, {
    skip: !isOwner,
  });

  const [deleteVideo] = useDeleteVideoMutation();
  const [updateVideo] = useUpdateVideoMutation();

  const videos = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;
  const processingVideos = isOwner
    ? videos.filter((video) => video.status !== 'READY')
    : [];

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleDelete = async (video: IVideoResponse) => {
    await deleteVideo(video.id).unwrap();
  };

  const handleDeleteById = async (videoId: string) => {
    await deleteVideo(videoId).unwrap();
  };

  const handleToggleVisibility = async (video: IVideoResponse) => {
    await updateVideo({
      videoId: video.id,
      visibility: video.visibility === 'unlisted' ? 'public' : 'unlisted',
    }).unwrap();
  };

  return (
    <div>
      {isOwner && (
        <ProcessingShelf items={processingVideos} onDelete={handleDeleteById} />
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
        <VideoGrid
          videos={videos}
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
        <VideoList
          videos={videos}
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

export default VideosTabPanel;
