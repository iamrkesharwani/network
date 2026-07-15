import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Film, Trash2 } from 'lucide-react';
import { formatDuration, getRelativeDate } from '@network/shared';
import type { IHistoryResponse } from '@network/shared';

export interface HistoryCardProps {
  entry: IHistoryResponse;
  onRemove?: (entry: IHistoryResponse) => Promise<void> | void;
}

const HistoryCard = ({ entry, onRemove }: HistoryCardProps) => {
  const [thumbError, setThumbError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const watchPath =
    entry.contentType === 'short'
      ? `/shorts/${entry.content.id}`
      : `/video/${entry.content.id}`;

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

        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white">
          {formatDuration(entry.content.duration)}
        </span>

        {entry.duration && entry.duration > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/40">
            <div
              className="h-full bg-primary"
              style={{ width: `${entry.progressPercent * 100}%` }}
            />
          </div>
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
          <span className="truncate">
            {getRelativeDate(entry.lastWatchedAt)}
            {entry.completed && ' · Watched'}
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="Remove from history"
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error-subtle transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
};

export default HistoryCard;
