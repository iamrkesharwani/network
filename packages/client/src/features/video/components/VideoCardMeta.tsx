import { Link } from 'react-router-dom';
import VideoCardMenu from './VideoCardMenu';
import { formatCount, getRelativeDate } from '@network/shared';
import type { IVideoResponse } from '@network/shared';
import Avatar from '../../../shared/components/Avatar';

interface VideoCardMetaProps {
  video: IVideoResponse;
  isOwner: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

const VideoCardMeta = ({
  video,
  isOwner,
  onEdit,
  onDeleteClick,
}: VideoCardMetaProps) => (
  <div className="flex items-start gap-3">
    <Link
      to={`/profile/${video.author.username}`}
      className="shrink-0 mt-0.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        to={`/video/${video.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {video.title}
        </h3>
      </Link>

      <Link
        to={`/profile/${video.author.username}`}
        className="block mt-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        onClick={(e) => e.stopPropagation()}
      >
        @{video.author.username}
      </Link>

      <p className="mt-0.5 text-xs text-text-muted">
        {formatCount(video.views)} views
        <span className="mx-1 opacity-40">·</span>
        {getRelativeDate(video.createdAt)}
      </p>
    </div>

    {isOwner && <VideoCardMenu onEdit={onEdit} onDeleteClick={onDeleteClick} />}
  </div>
);

export default VideoCardMeta;
