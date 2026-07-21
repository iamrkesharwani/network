import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useGetVideoByIdQuery } from '../videoApi';
import VideoPlayer from '../../player/variants/video/VideoPlayer';
import VideoWatchSkeleton from '../skeleton/VideoWatchSkeleton';
import VideoMetaRail from '../components/VideoMetaRail';
import VideoEngagementPanel, {
  type VideoEngagementActivePanel,
} from '../components/VideoEngagementPanel';
import UpNextRail from '../components/UpNextRail';
import SuggestionsGrid from '../components/SuggestionsGrid';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';

const VideoWatch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const isMobileLayout = useIsMobileLayout();
  const [activePanel, setActivePanel] =
    useState<VideoEngagementActivePanel>(null);
  const didDefaultPanel = useRef(false);

  useEffect(() => {
    if (didDefaultPanel.current || isMobileLayout) return;
    didDefaultPanel.current = true;
    setActivePanel('comments');
  }, [isMobileLayout]);

  const { data, isLoading, isError } = useGetVideoByIdQuery(videoId ?? '', {
    skip: !videoId,
  });

  const video = data?.data;

  const socketRef = useSocketContext();
  useContentRoom(socketRef, 'video', videoId ?? '', rootRef);

  usePageTitle(video ? video.title : 'Video');

  const togglePanel = (panel: 'comments' | 'description') => {
    setActivePanel((current) => {
      if (isMobileLayout) return current === panel ? null : panel;
      if (panel === 'description') {
        return current === 'description' ? 'comments' : 'description';
      }
      return 'comments';
    });
  };

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
    <div ref={rootRef} className="flex w-full flex-col">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-4">
        <div className="flex flex-col gap-3">
          <VideoPlayer
            video={video}
            className="-mx-4 max-md:w-[calc(100%+2rem)] md:-mx-5 md:-mt-5 md:max-lg:w-[calc(100%+2.5rem)] lg:mr-0"
            upNextSlot={
              <UpNextRail
                videoId={video.id}
                onShowMore={() =>
                  suggestionsRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
              />
            }
          />

          <VideoMetaRail
            video={video}
            descriptionOpen={activePanel === 'description'}
            onToggleDescription={() => togglePanel('description')}
          />
        </div>

        <VideoEngagementPanel
          video={video}
          activePanel={activePanel}
          onToggleComments={() => togglePanel('comments')}
          onToggleDescription={() => togglePanel('description')}
        />
      </div>

      <div ref={suggestionsRef} className="py-4">
        <SuggestionsGrid videoId={video.id} />
      </div>
    </div>
  );
};

export default VideoWatch;
