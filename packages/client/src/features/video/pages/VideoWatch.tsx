import { Link, Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CLIENT_ROUTES, formatCount } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useGetVideoByIdQuery } from '../videoApi';
import VideoPlayer from '../../player/variants/video/VideoPlayer';

const VideoWatch = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const { data, isLoading, isError } = useGetVideoByIdQuery(videoId ?? '', {
    skip: !videoId,
  });

  const video = data?.data;

  usePageTitle(video ? video.title : 'Video');

  if (!videoId) {
    return <Navigate to={CLIENT_ROUTES.FEED} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm text-text-muted">This video couldn't be found.</p>
        <Link
          to={CLIENT_ROUTES.FEED}
          className="rounded-full bg-surface-overlay px-4 py-1.5 text-sm font-medium hover:bg-surface-raised"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 py-4">
      <VideoPlayer video={video} />

      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-text">{video.title}</h1>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-overlay ring-1 ring-border">
            {video.author.avatarUrl && (
              <img
                src={video.author.avatarUrl}
                alt={video.author.username}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <Link
            to={CLIENT_ROUTES.PROFILE.replace(
              ':username',
              video.author.username
            )}
            className="text-sm font-medium text-text hover:underline"
          >
            @{video.author.username}
          </Link>
          <span className="text-sm text-text-muted">
            {formatCount(video.views)} views · {formatCount(video.likes)} likes
          </span>
        </div>

        {video.description && (
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoWatch;
