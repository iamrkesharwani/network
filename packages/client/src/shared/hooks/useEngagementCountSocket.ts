import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import { videoApi } from '../../features/video/videoApi';
import { shortApi } from '../../features/short/shortApi';
import { postApi } from '../../features/post/postApi';
import { commentApi } from '../../features/engagement/commentApi';
import type { RootState } from '../../app/store/store';
import type { useSocket } from './useSocket';
import {
  ENGAGEMENT_COUNT_SOCKET_EVENT,
  type IEngagementCountEvent,
} from '@network/shared';

export const useEngagementCountSocket = (
  socketRef: ReturnType<typeof useSocket>
): void => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleEngagementCount = (event: IEngagementCountEvent) => {
      const { contentType, contentId, field, count } = event;
      const patch =
        field === 'likes' ? { likes: count } : { commentsCount: count };

      if (contentType === 'post') {
        dispatch(
          postApi.util.updateQueryData('getPostById', contentId, (draft) => {
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
                const item = draft.data.find((p) => p.id === contentId);
                if (item) Object.assign(item, patch);
              })
            );
          }
        }
      } else if (contentType === 'video') {
        dispatch(
          videoApi.util.updateQueryData('getVideoById', contentId, (draft) => {
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
                const item = draft.data.find((v) => v.id === contentId);
                if (item) Object.assign(item, patch);
              })
            );
          }
        }
      } else if (contentType === 'short') {
        dispatch(
          shortApi.util.updateQueryData('getShortById', contentId, (draft) => {
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
                const item = draft.data.find((s) => s.id === contentId);
                if (item) Object.assign(item, patch);
              })
            );
          }
        }
      } else {
        const commentPatch =
          field === 'likes' ? { likes: count } : { repliesCount: count };
        const cachedArgs = commentApi.util.selectCachedArgsForQuery(
          store.getState(),
          'listComments'
        );
        for (const args of cachedArgs) {
          dispatch(
            commentApi.util.updateQueryData('listComments', args, (draft) => {
              const item = draft.data.find((c) => c.id === contentId);
              if (item) Object.assign(item, commentPatch);
            })
          );
        }
      }
    };

    socket.on(ENGAGEMENT_COUNT_SOCKET_EVENT, handleEngagementCount);

    return () => {
      socket.off(ENGAGEMENT_COUNT_SOCKET_EVENT, handleEngagementCount);
    };
  }, [dispatch, socketRef, store]);
};
