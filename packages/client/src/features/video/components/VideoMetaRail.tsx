import { Link } from 'react-router-dom';
import { CLIENT_ROUTES, type IVideoResponse } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import CommentsPlaceholder from './CommentsPlaceholder';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';

interface VideoMetaRailProps {
  video: IVideoResponse;
}

const VideoMetaRail = ({ video }: VideoMetaRailProps) => {
  const profileHref = CLIENT_ROUTES.PROFILE.replace(
    ':username',
    video.author.username
  );

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-text-primary lg:rounded-lg lg:border lg:border-border lg:p-3">
        {video.title}
      </h1>

      <div className="flex items-center justify-between gap-3 lg:rounded-lg lg:border lg:border-border lg:p-3">
        <div className="flex items-center gap-3">
          <Link to={profileHref}>
            <Avatar
              src={video.author.avatarUrl}
              alt={video.author.username}
              size="md"
              fallback={video.author.username}
            />
          </Link>
          <Link
            to={profileHref}
            className="text-sm font-medium text-text-primary hover:underline"
          >
            @{video.author.username}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LikeButton compact />
          <ShareButton compact />
          <CommentsPlaceholder compact />
        </div>
      </div>

      <CommentsPlaceholder className="hidden lg:flex" />

      <div className="hidden items-center gap-3 lg:flex">
        <LikeButton className="flex-1" />
        <ShareButton className="flex-1" />
      </div>
    </div>
  );
};

export default VideoMetaRail;
