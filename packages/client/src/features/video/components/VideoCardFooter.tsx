import { Link } from 'react-router-dom';
import { formatCount } from '@network/shared';
import type { IVideoResponse } from '@network/shared';

interface VideoCardFooterProps {
  video: IVideoResponse;
}

const VideoCardFooter = ({ video }: VideoCardFooterProps) => (
  <div>
    <Link
      to={`/video/${video.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
    >
      <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
        {video.title}
      </h3>
    </Link>

    <p className="mt-1 text-xs text-text-muted">
      {video.likes > 0 && `${formatCount(video.likes)} likes`}
      {video.likes > 0 && video.views > 0 && ' · '}
      {video.views > 0 && `${formatCount(video.views)} views`}
    </p>
  </div>
);

export default VideoCardFooter;
