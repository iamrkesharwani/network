import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatCount, getRelativeDate } from '@network/shared';
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

      <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          {formatCount(video.views)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" strokeWidth={2} />
          {formatCount(video.likes)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
          {formatCount(video.commentsCount)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
          {formatCount(video.shares)}
        </span>
        <span>{getRelativeDate(video.createdAt)}</span>
      </div>
    </div>

    {menu}
  </div>
);

export default VideoCardFooter;
