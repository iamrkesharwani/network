import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  CLIENT_ROUTES,
  PLAYLIST_QUEUE_PARAM,
  NOTIFICATION_COMMENT_PARAM,
  NOTIFICATION_THREAD_PARAM,
} from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useGetVideoByIdQuery } from '../videoApi';
import { useGetPlaylistItemsQuery } from '../../playlist/playlistApi';
import PlaylistQueueRail from '../../playlist/components/PlaylistQueueRail';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playlistId = searchParams.get(PLAYLIST_QUEUE_PARAM);
  const highlightCommentId =
    searchParams.get(NOTIFICATION_COMMENT_PARAM) ?? undefined;
  const threadRootId = searchParams.get(NOTIFICATION_THREAD_PARAM) ?? undefined;
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const isMobileLayout = useIsMobileLayout();
  const [activePanel, setActivePanel] = useState<VideoEngagementActivePanel>(
    highlightCommentId ? 'comments' : null
  );
  const didDefaultPanel = useRef(Boolean(highlightCommentId));

  useEffect(() => {
    if (didDefaultPanel.current || isMobileLayout) return;
    didDefaultPanel.current = true;
    setActivePanel('comments');
  }, [isMobileLayout]);

  const { data, isLoading, isError } = useGetVideoByIdQuery(videoId ?? '', {
    skip: !videoId,
  });

  const video = data?.data;

  const { data: playlistItemsData } = useGetPlaylistItemsQuery(
    { playlistId: playlistId ?? '', limit: 100 },
    { skip: !playlistId }
  );

  const playlistVideoItems = useMemo(
    () =>
      (playlistItemsData?.data ?? [])
        .filter((item) => item.contentType === 'video')
        .sort((a, b) => a.position - b.position),
    [playlistItemsData]
  );

  const nextPlaylistItem = useMemo(() => {
    if (!playlistId || !video) return undefined;
    const currentIndex = playlistVideoItems.findIndex(
      (item) => item.content.id === video.id
    );
    return currentIndex === -1
      ? undefined
      : playlistVideoItems[currentIndex + 1];
  }, [playlistId, video, playlistVideoItems]);

  const handlePlaylistEnded = useCallback(() => {
    if (!playlistId || !nextPlaylistItem) return;
    navigate(
      `${CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', nextPlaylistItem.content.id)}?${PLAYLIST_QUEUE_PARAM}=${playlistId}`
    );
  }, [playlistId, nextPlaylistItem, navigate]);

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
            onEnded={playlistId ? handlePlaylistEnded : undefined}
            upNextSlot={
              playlistId && playlistVideoItems.length > 0 ? (
                <PlaylistQueueRail
                  playlistId={playlistId}
                  items={playlistVideoItems}
                  currentVideoId={video.id}
                />
              ) : (
                <UpNextRail
                  videoId={video.id}
                  onShowMore={() =>
                    suggestionsRef.current?.scrollIntoView({
                      behavior: 'smooth',
                    })
                  }
                />
              )
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
          highlightCommentId={highlightCommentId}
          threadRootId={threadRootId}
        />
      </div>

      <div ref={suggestionsRef} className="py-4">
        <SuggestionsGrid videoId={video.id} />
      </div>
    </div>
  );
};

export default VideoWatch;
