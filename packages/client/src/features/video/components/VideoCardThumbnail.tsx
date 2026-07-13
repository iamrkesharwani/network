import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CLIENT_ROUTES, type IVideoResponse } from '@network/shared';
import MediaDurationBadge from '../../../shared/ui/card/MediaDurationBadge';
import MediaVisibilityBadge from '../../../shared/ui/card/MediaVisibilityBadge';
import UnlistedCountdownBadge from '../../../shared/ui/card/UnlistedCountdownBadge';

interface VideoCardThumbnailProps {
  video: IVideoResponse;
  isReady: boolean;
  isUnlisted?: boolean;
  daysLeft?: number | null;
}

const VideoCardThumbnail = ({
  video,
  isReady,
  isUnlisted = false,
  daysLeft = null,
}: VideoCardThumbnailProps) => {
  const [thumbError, setThumbError] = useState(false);

  return (
    <Link
      to={CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', video.id)}
      className="relative block w-full aspect-video rounded-xl max-md:portrait:rounded-none overflow-hidden bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

      <MediaDurationBadge durationSeconds={video.duration} />
      <MediaVisibilityBadge visibility={video.visibility} />
      {isUnlisted && <UnlistedCountdownBadge daysLeft={daysLeft} />}

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
