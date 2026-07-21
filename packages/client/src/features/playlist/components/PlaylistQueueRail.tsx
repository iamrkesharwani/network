import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import {
  CLIENT_ROUTES,
  PLAYLIST_QUEUE_PARAM,
  formatDuration,
  type IPlaylistItemResponse,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';

export interface PlaylistQueueRailProps {
  playlistId: string;
  items: IPlaylistItemResponse[];
  currentVideoId: string;
}

const PlaylistQueueRail = ({
  playlistId,
  items,
  currentVideoId,
}: PlaylistQueueRailProps) => {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-2 pb-1">
      <p className="px-0.5 text-xs font-medium text-text-secondary">
        Up next in playlist
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item, index) => {
          const isActive = item.content.id === currentVideoId;
          const path = `${CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', item.content.id)}?${PLAYLIST_QUEUE_PARAM}=${playlistId}`;

          return (
            <Link
              key={item.id}
              to={path}
              className={cn(
                'relative w-56 shrink-0 overflow-hidden rounded-lg',
                isActive && 'ring-2 ring-primary'
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface-raised">
                {item.content.thumbnailUrl && (
                  <img
                    src={item.content.thumbnailUrl}
                    alt={item.content.title}
                    className="h-full w-full object-cover"
                  />
                )}

                <span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                  {isActive ? (
                    <Play className="h-3 w-3" strokeWidth={2} />
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                  {formatDuration(item.content.duration)}
                </span>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-2.5 pt-6 pb-2">
                <p className="line-clamp-1 text-xs font-medium text-white">
                  {item.content.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistQueueRail;
