import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { IPlaylistSummary } from '@network/shared';
import Button from '../../../shared/ui/primitives/Button';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import PlaylistList from './PlaylistList';
import CreatePlaylistModal from '../form/CreatePlaylistModal';
import {
  useGetUserPlaylistsQuery,
  useDeletePlaylistMutation,
} from '../playlistApi';

export interface PlaylistTabPanelProps {
  username: string;
  isOwner: boolean;
}

const PlaylistTabPanel = ({ username, isOwner }: PlaylistTabPanelProps) => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IPlaylistSummary | null>(
    null
  );

  useEffect(() => {
    setCursor(undefined);
  }, [username]);

  const isFirstPage = cursor === undefined;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetUserPlaylistsQuery({
      username,
      limit: 20,
      ...(cursor !== undefined && { cursor }),
    });

  const [deletePlaylist, { isLoading: isDeleting }] =
    useDeletePlaylistMutation();

  const playlists = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await deletePlaylist(pendingDelete.id).unwrap();
    setPendingDelete(null);
  };

  return (
    <div>
      {isOwner && (
        <div className="flex items-center justify-end mb-4">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
            New playlist
          </Button>
        </div>
      )}

      <PlaylistList
        playlists={playlists}
        isLoading={isLoading && isFirstPage}
        isFetchingNextPage={isFetching && !isFirstPage}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        onRetry={refetch}
        isError={isError}
        isOwner={isOwner}
        onDeleteClick={setPendingDelete}
      />

      {isOwner && (
        <CreatePlaylistModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        intent="danger"
        title="Delete this playlist?"
        description={`This removes "${pendingDelete?.title ?? ''}" and all of its items. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PlaylistTabPanel;
