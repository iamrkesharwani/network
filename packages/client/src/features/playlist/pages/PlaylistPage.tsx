import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ListMusic } from 'lucide-react';
import type { IPlaylistItemResponse, ViewMode } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import ViewModeToggle from '../../../shared/ui/misc/ViewModeToggle';
import PlaylistErrorState from '../components/PlaylistErrorState';
import PlaylistHero from '../components/PlaylistHero';
import PlaylistItemsSortable from '../components/PlaylistItemsSortable';
import CreatePlaylistModal from '../form/CreatePlaylistModal';
import PlaylistPageSkeleton from '../skeleton/PlaylistPageSkeleton';
import {
  useGetPlaylistQuery,
  useGetPlaylistItemsQuery,
  useDeletePlaylistMutation,
  useRemoveItemFromPlaylistMutation,
  useReorderPlaylistItemsMutation,
} from '../playlistApi';

const PlaylistPage = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const {
    data: playlistData,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
    refetch: refetchPlaylist,
  } = useGetPlaylistQuery(playlistId ?? '', { skip: !playlistId });

  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isError: isItemsError,
    refetch: refetchItems,
  } = useGetPlaylistItemsQuery(
    { playlistId: playlistId ?? '', limit: 100 },
    { skip: !playlistId }
  );

  const [deletePlaylist, { isLoading: isDeleting }] =
    useDeletePlaylistMutation();
  const [removeItem] = useRemoveItemFromPlaylistMutation();
  const [reorderItems] = useReorderPlaylistItemsMutation();

  const playlist = playlistData?.data;
  const items = itemsData?.data ?? [];
  const isOwner = Boolean(currentUserId) && currentUserId === playlist?.userId;

  usePageTitle(playlist?.title ?? 'Playlist');

  const handleRemove = (item: IPlaylistItemResponse) => {
    if (!playlistId) return;
    removeItem({ playlistId, itemId: item.id, contentId: item.content.id });
  };

  const handleReorder = (itemId: string, toIndex: number) => {
    if (!playlistId) return;
    reorderItems({ playlistId, itemId, toIndex });
  };

  const handleDelete = async () => {
    if (!playlistId) return;
    await deletePlaylist(playlistId).unwrap();
    setDeleteOpen(false);
    window.history.back();
  };

  if (!playlistId || isPlaylistError) {
    return <PlaylistErrorState onRetry={refetchPlaylist} />;
  }

  if (isPlaylistLoading || !playlist) {
    return <PlaylistPageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PlaylistHero
        playlist={playlist}
        items={items}
        isOwner={isOwner}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      {isItemsError ? (
        <PlaylistErrorState onRetry={refetchItems} />
      ) : isItemsLoading && items.length === 0 ? (
        <PlaylistPageSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
            <ListMusic className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-text-muted">
            This playlist doesn't have any items yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>

          <PlaylistItemsSortable
            items={items}
            isOwner={isOwner}
            viewMode={viewMode}
            onReorder={handleReorder}
            onRemove={handleRemove}
          />
        </div>
      )}

      {isOwner && (
        <>
          <CreatePlaylistModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            playlist={playlist}
          />

          <ConfirmModal
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            intent="danger"
            title="Delete this playlist?"
            description={`This removes "${playlist.title}" and all of its items. This action cannot be undone.`}
            confirmLabel="Delete"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default PlaylistPage;
