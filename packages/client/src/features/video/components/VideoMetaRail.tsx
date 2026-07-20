import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import {
  CLIENT_ROUTES,
  formatCount,
  type IVideoResponse,
} from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import LikeButton from '../../engagement/components/LikeButton';
import ShareSheet from '../../engagement/components/ShareSheet';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';

interface VideoMetaRailProps {
  video: IVideoResponse;
}

const VideoMetaRail = ({ video }: VideoMetaRailProps) => {
  const profileHref = CLIENT_ROUTES.PROFILE.replace(
    ':username',
    video.author.username
  );

  const { data: likeStatusData } = useGetLikeStatusesQuery({
    contentType: 'video',
    contentIds: [video.id],
  });
  const liked = likeStatusData?.data[video.id] ?? false;

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
          <LikeButton
            contentType="video"
            contentId={video.id}
            initialLiked={liked}
            initialLikesCount={video.likes}
            size="sm"
          />
          <ShareSheet contentType="video" contentId={video.id} compact />
        </div>
      </div>

      <a
        href="#comments"
        className="hidden items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary lg:flex"
      >
        <MessageCircle className="h-4 w-4" />
        {formatCount(video.commentsCount)} comments
      </a>

      <div className="hidden items-center gap-3 lg:flex">
        <LikeButton
          contentType="video"
          contentId={video.id}
          initialLiked={liked}
          initialLikesCount={video.likes}
          className="flex-1"
        />
        <ShareSheet
          contentType="video"
          contentId={video.id}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default VideoMetaRail;
