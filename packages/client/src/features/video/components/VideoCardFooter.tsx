import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatCount } from '@network/shared';
import type { IVideoResponse } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';

interface VideoCardFooterProps {
  video: IVideoResponse;
  menu?: ReactNode;
}

const VideoCardFooter = ({ video, menu }: VideoCardFooterProps) => (
  <div className="flex items-start gap-3 px-0.5">
    <Link
      to={`/profile/${video.author.username}`}
      className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={(e) => e.stopPropagation()}
    >
      <Avatar
        src={video.author.avatarUrl}
        alt={video.author.username}
        size="sm"
        fallback={video.author.username}
      />
    </Link>

    <div className="flex-1 min-w-0">
      <Link
        to={`/profile/${video.author.username}`}
        className="text-xs text-text-muted hover:text-text-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        onClick={(e) => e.stopPropagation()}
      >
        @{video.author.username}
      </Link>

      <Link
        to={`/video/${video.id}`}
        className="block mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {video.title}
        </h3>
      </Link>

      <p className="mt-1 text-xs text-text-muted">
        {formatCount(video.likes)} likes · {formatCount(video.views)} views
      </p>
    </div>

    {menu}
  </div>
);

export default VideoCardFooter;
