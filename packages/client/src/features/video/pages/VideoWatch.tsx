import { useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useGetVideoByIdQuery } from '../videoApi';
import VideoPlayer from '../../player/variants/video/VideoPlayer';
import VideoWatchSkeleton from '../skeleton/VideoWatchSkeleton';
import VideoDescription from '../components/VideoDescription';
import VideoMetaRail from '../components/VideoMetaRail';
import LikesViewsCount from '../components/LikesViewsCount';
import UpNextRail from '../components/UpNextRail';
import SuggestionsGrid from '../components/SuggestionsGrid';

const VideoWatch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useGetVideoByIdQuery(videoId ?? '', {
    skip: !videoId,
  });

  const video = data?.data;

  usePageTitle(video ? video.title : 'Video');

  if (!videoId) {
    return <Navigate to={CLIENT_ROUTES.FEED} replace />;
  }

  if (isLoading) {
    return <VideoWatchSkeleton />;
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
    <div className="flex w-full flex-col">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-4">
        <VideoPlayer
          video={video}
          className="-mx-4 max-md:w-[calc(100%_+_2rem)] md:-mx-5 md:-mt-5 md:max-lg:w-[calc(100%_+_2.5rem)] lg:mr-0"
          upNextSlot={
            <UpNextRail
              videoId={video.id}
              onShowMore={() =>
                suggestionsRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
            />
          }
        />

        <VideoMetaRail video={video} />
      </div>

      <div className="flex flex-col gap-4 py-4">
        <VideoDescription
          description={video.description}
          trailing={<LikesViewsCount likes={video.likes} views={video.views} />}
        />

        <div ref={suggestionsRef}>
          <SuggestionsGrid videoId={video.id} />
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;
