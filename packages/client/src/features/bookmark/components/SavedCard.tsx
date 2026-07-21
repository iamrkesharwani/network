import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Film, FileText, X } from 'lucide-react';
import {
  CLIENT_ROUTES,
  formatDuration,
  type IBookmarkResponse,
} from '@network/shared';

export interface SavedCardProps {
  entry: IBookmarkResponse;
  onRemove?: (entry: IBookmarkResponse) => Promise<void> | void;
}

const WATCH_PATH_BUILDER: Record<
  IBookmarkResponse['contentType'],
  (id: string) => string
> = {
  video: (id) => CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', id),
  short: (id) => CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', id),
  post: (id) => CLIENT_ROUTES.POST_WATCH.replace(':postId', id),
};

const SavedCard = ({ entry, onRemove }: SavedCardProps) => {
  const [thumbError, setThumbError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const watchPath = WATCH_PATH_BUILDER[entry.contentType](entry.content.id);

  const handleRemove = async () => {
    if (!onRemove || isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(entry);
    } catch {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        to={watchPath}
        className="relative shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-surface-raised"
      >
        {entry.content.thumbnailUrl && !thumbError ? (
          <img
            src={entry.content.thumbnailUrl}
            alt={entry.content.title}
            onError={() => setThumbError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play
              className="w-5 h-5 text-text-muted opacity-40"
              strokeWidth={1.5}
            />
          </div>
        )}

        {entry.content.duration !== undefined && (
          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white">
            {formatDuration(entry.content.duration)}
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={watchPath} className="block">
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
            {entry.content.title}
          </h3>
        </Link>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
          {entry.contentType === 'short' && (
            <Film className="w-3 h-3 shrink-0" strokeWidth={2} />
          )}
          {entry.contentType === 'post' && (
            <FileText className="w-3 h-3 shrink-0" strokeWidth={2} />
          )}
          <span className="capitalize">{entry.contentType}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="Remove from saved"
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error-subtle transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
};

export default SavedCard;
