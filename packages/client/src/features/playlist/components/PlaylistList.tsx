import { Loader2 } from 'lucide-react';
import type { IPlaylistSummary } from '@network/shared';
import PlaylistCard from './PlaylistCard';
import PlaylistEmptyState from './PlaylistEmptyState';
import PlaylistErrorState from './PlaylistErrorState';

export interface PlaylistListProps {
  playlists: IPlaylistSummary[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  isError?: boolean;
  isOwner?: boolean;
  onDeleteClick?: (playlist: IPlaylistSummary) => void;
}

const PlaylistList = ({
  playlists,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onRetry,
  isError = false,
  isOwner = false,
  onDeleteClick,
}: PlaylistListProps) => {
  if (isLoading && playlists.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && playlists.length === 0) {
    return <PlaylistErrorState onRetry={onRetry} />;
  }

  if (playlists.length === 0) {
    return <PlaylistEmptyState />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            isOwner={isOwner}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>

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

export default PlaylistList;
