import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import { useToast } from './useToast';
import { videoApi } from '../../features/video/videoApi';
import { shortApi } from '../../features/short/shortApi';
import { postApi } from '../../features/post/postApi';
import type { RootState } from '../../app/store/store';
import type { useSocket } from './useSocket';
import {
  MEDIA_STATUS_SOCKET_EVENT,
  type IMediaStatusEvent,
} from '@network/shared';

interface MediaCachePatch {
  status: IMediaStatusEvent['status'];
  progress?: number;
  duration?: number;
  playbackUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

const buildMediaPatch = (event: IMediaStatusEvent): MediaCachePatch => ({
  status: event.status,
  ...(event.status === 'PROCESSING' && { progress: event.progress }),
  ...(event.duration !== undefined && { duration: event.duration }),
  ...(event.playbackUrl !== undefined && { playbackUrl: event.playbackUrl }),
  ...(event.thumbnailUrl !== undefined && { thumbnailUrl: event.thumbnailUrl }),
  ...(event.errorMessage !== undefined && { errorMessage: event.errorMessage }),
});

export const useMediaStatusSocket = (
  socket: ReturnType<typeof useSocket>
): void => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleMediaStatus = (event: IMediaStatusEvent) => {
      const patch = buildMediaPatch(event);

      if (event.mediaType === 'video') {
        dispatch(
          videoApi.util.updateQueryData('getVideoById', event.id, (draft) => {
            Object.assign(draft.data, patch);
          })
        );
        for (const listEndpoint of ['getMyVideos', 'getUserVideos'] as const) {
          const cachedArgs = videoApi.util.selectCachedArgsForQuery(
            store.getState(),
            listEndpoint
          );
          for (const args of cachedArgs) {
            dispatch(
              videoApi.util.updateQueryData(listEndpoint, args, (draft) => {
                const item = draft.data.find((v) => v.id === event.id);
                if (item) Object.assign(item, patch);
              })
            );
          }
        }
      } else if (event.mediaType === 'short') {
        dispatch(
          shortApi.util.updateQueryData('getShortById', event.id, (draft) => {
            Object.assign(draft.data, patch);
          })
        );
        for (const listEndpoint of ['getMyShorts', 'getUserShorts'] as const) {
          const cachedArgs = shortApi.util.selectCachedArgsForQuery(
            store.getState(),
            listEndpoint
          );
          for (const args of cachedArgs) {
            dispatch(
              shortApi.util.updateQueryData(listEndpoint, args, (draft) => {
                const item = draft.data.find((s) => s.id === event.id);
                if (item) Object.assign(item, patch);
              })
            );
          }
        }
      } else {
        dispatch(
          postApi.util.updateQueryData('getPostById', event.id, (draft) => {
            Object.assign(draft.data, patch);
          })
        );
        for (const listEndpoint of ['getMyPosts', 'getUserPosts'] as const) {
          const cachedArgs = postApi.util.selectCachedArgsForQuery(
            store.getState(),
            listEndpoint
          );
          for (const args of cachedArgs) {
            dispatch(
              postApi.util.updateQueryData(listEndpoint, args, (draft) => {
                const item = draft.data.find((p) => p.id === event.id);
                if (item) Object.assign(item, patch);
              })
            );
          }
        }
      }

      const label = event.title ? `"${event.title}"` : 'Your post';

      if (event.status === 'READY') {
        addToast(`${label} is now live`, 'success', 3000, {
          label: 'View',
          onClick: () => navigate(`/${event.mediaType}/${event.id}`),
        });
      } else if (event.status === 'FAILED') {
        addToast(`Processing failed for ${label}`, 'error');
      }
    };

    socket.on(MEDIA_STATUS_SOCKET_EVENT, handleMediaStatus);

    return () => {
      socket.off(MEDIA_STATUS_SOCKET_EVENT, handleMediaStatus);
    };
  }, [dispatch, addToast, navigate, socket, store]);
};
