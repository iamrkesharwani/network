import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, EyeOff } from 'lucide-react';
import { formatDuration } from '@network/shared';
import type { IVideoResponse } from '@network/shared';

interface VideoCardThumbnailProps {
  video: IVideoResponse;
  isReady: boolean;
}

const VideoCardThumbnail = ({ video, isReady }: VideoCardThumbnailProps) => {
  const [thumbError, setThumbError] = useState(false);

  return (
    <Link
      to={`/video/${video.id}`}
      className="relative block w-full aspect-video rounded-xl overflow-hidden bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      tabIndex={isReady ? 0 : -1}
      aria-disabled={!isReady}
    >
      {video.thumbnailUrl && !thumbError ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          onError={() => setThumbError(true)}
          draggable={false}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-surface-overlay to-surface-raised flex items-center justify-center">
          <Play
            className="w-10 h-10 text-text-muted opacity-40"
            strokeWidth={1.5}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
          <Play
            className="w-5 h-5 text-white fill-white ml-0.5"
            strokeWidth={0}
          />
        </div>
      </div>

      {video.duration > 0 && (
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[11px] font-medium font-mono tabular-nums bg-black/70 text-white backdrop-blur-sm leading-tight">
          {formatDuration(video.duration)}
        </span>
      )}

      {video.visibility !== 'public' && (
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/70 text-text-secondary backdrop-blur-sm leading-tight">
          <EyeOff className="w-3 h-3" strokeWidth={2} />
          {video.visibility === 'private' ? 'Private' : 'Unlisted'}
        </span>
      )}

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/70 backdrop-blur-[2px]">
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay text-text-secondary border border-border capitalize tracking-wide">
            {video.status === 'FAILED'
              ? '⚠ Processing failed'
              : video.status.toLowerCase()}
          </span>
        </div>
      )}
    </Link>
  );
};

export default VideoCardThumbnail;
