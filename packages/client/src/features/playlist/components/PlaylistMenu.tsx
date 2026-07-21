import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ListPlus, Loader2, Plus } from 'lucide-react';
import type { PlaylistContentType } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import CreatePlaylistModal from '../form/CreatePlaylistModal';
import {
  useGetContainingPlaylistsQuery,
  useAddItemToPlaylistMutation,
  useRemoveItemFromPlaylistMutation,
} from '../playlistApi';

export interface PlaylistMenuProps {
  contentType: PlaylistContentType;
  contentId: string;
  renderTrigger?: (props: {
    onClick: () => void;
    isOpen: boolean;
  }) => ReactNode;
}

interface MenuPosition {
  top: number;
  right: number;
}

const PlaylistMenu = ({
  contentType,
  contentId,
  renderTrigger,
}: PlaylistMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetContainingPlaylistsQuery(
    { contentType, contentId },
    { skip: !menuOpen }
  );

  const [addItem] = useAddItemToPlaylistMutation();
  const [removeItem] = useRemoveItemFromPlaylistMutation();

  const entries = data?.data ?? [];

  useEffect(() => {
    setOverrides((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const entry of entries) {
        if (
          entry.playlistId in next &&
          next[entry.playlistId] === entry.contains
        ) {
          delete next[entry.playlistId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [entries]);

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setMenuOpen(true);
  };

  const handleToggleOpen = () => {
    if (menuOpen) {
      setMenuOpen(false);
    } else {
      openMenu();
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuOpen]);

  const setPending = (playlistId: string, isPending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(playlistId);
      else next.delete(playlistId);
      return next;
    });
  };

  const handleAdd = async (playlistId: string) => {
    setPending(playlistId, true);
    try {
      await addItem({ playlistId, contentType, contentId }).unwrap();
      setOverrides((prev) => ({ ...prev, [playlistId]: true }));
    } finally {
      setPending(playlistId, false);
    }
  };

  const handleRemove = async (playlistId: string, itemId: string) => {
    setPending(playlistId, true);
    try {
      await removeItem({ playlistId, itemId, contentId }).unwrap();
      setOverrides((prev) => ({ ...prev, [playlistId]: false }));
    } finally {
      setPending(playlistId, false);
    }
  };

  return (
    <div ref={triggerRef} className="relative inline-flex shrink-0">
      {renderTrigger ? (
        renderTrigger({ onClick: handleToggleOpen, isOpen: menuOpen })
      ) : (
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label="Add to playlist"
          aria-expanded={menuOpen}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <ListPlus className="h-4 w-4" strokeWidth={2} />
        </button>
      )}

      {menuOpen &&
        position &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              style={{
                position: 'fixed',
                top: position.top,
                right: position.right,
              }}
              className="z-50 w-72 py-1.5 rounded-xl bg-surface-overlay border border-border shadow-xl shadow-black/40"
            >
              <p className="px-3 pt-1 pb-2 text-xs font-semibold text-text-muted">
                Save to playlist
              </p>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                </div>
              ) : entries.length === 0 ? (
                <p className="px-3 py-2 text-sm text-text-muted">
                  You don't have any playlists yet.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  {entries.map((entry) => {
                    const contains =
                      overrides[entry.playlistId] ?? entry.contains;
                    const isPending = pendingIds.has(entry.playlistId);
                    const canToggle =
                      !isPending && (!contains || entry.itemId !== undefined);

                    return (
                      <div
                        key={entry.playlistId}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                          {entry.title}
                        </span>

                        <button
                          type="button"
                          disabled={!canToggle}
                          onClick={() => {
                            if (!canToggle) return;
                            if (contains) {
                              handleRemove(
                                entry.playlistId,
                                entry.itemId as string
                              );
                            } else {
                              handleAdd(entry.playlistId);
                            }
                          }}
                          className={cn(
                            'inline-flex min-w-19.5 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                            contains
                              ? 'bg-primary-muted text-primary'
                              : 'border border-border text-text-secondary hover:border-primary hover:text-primary',
                            isPending && 'opacity-70'
                          )}
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : contains ? (
                            <>
                              <Check className="h-3.5 w-3.5 shrink-0" />
                              Saved
                            </>
                          ) : (
                            'Add'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-1 border-t border-border pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setCreateOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-surface-raised transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  Create new playlist
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      <CreatePlaylistModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(playlist) => {
          void handleAdd(playlist.id);
        }}
      />
    </div>
  );
};

export default PlaylistMenu;
