import type { IVideoResponse } from '@network/shared';
import VideoListRow from '../components/VideoListRow';
import VideoEmptyState from '../components/VideoEmptyState';
import VideoErrorState from '../components/VideoErrorState';
import { Loader2 } from 'lucide-react';

export interface VideoListProps {
  videos: IVideoResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onDelete?: (video: IVideoResponse) => Promise<void> | void;
  onToggleVisibility?: (video: IVideoResponse) => Promise<void> | void;
  onRetry?: () => void;
  isOwner?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

const VideoList = ({
  videos,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onDelete,
  onToggleVisibility,
  onRetry,
  isOwner = false,
  isError = false,
  emptyMessage = 'No videos yet',
  emptySubMessage = "When videos are added they'll appear here.",
}: VideoListProps) => {
  if (isLoading && videos.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && videos.length === 0) {
    return <VideoErrorState onRetry={onRetry} />;
  }

  if (videos.length === 0) {
    return (
      <VideoEmptyState message={emptyMessage} subMessage={emptySubMessage} />
    );
  }

  return (
    <div className="divide-y divide-border">
      {videos.map((video) => (
        <VideoListRow
          key={video.id}
          video={video}
          isOwner={isOwner}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-surface-overlay border border-border transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoList;
