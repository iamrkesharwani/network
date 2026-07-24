import type { Middleware } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/authApi';
import { videoApi } from '../../features/video/videoApi';
import { shortApi } from '../../features/short/shortApi';
import { postApi } from '../../features/post/postApi';
import { creatorApi } from '../../features/creator/creatorApi';
import { uploadApi } from '../../features/upload/uploadApi';
import { feedApi } from '../../features/feed/feedApi';
import { preferencesApi } from '../../features/settings/preferencesApi';
import { settingsApi } from '../../features/settings/settingsApi';
import { accountApi } from '../../features/settings/accountApi';
import { searchApi } from '../../features/search/searchApi';
import { historyApi } from '../../features/history/historyApi';
import { reportApi } from '../../features/report/reportApi';
import { juryApi } from '../../features/jury/juryApi';
import { followApi } from '../../features/follow/followApi';
import { blockApi } from '../../features/block/blockApi';
import { likeApi } from '../../features/engagement/likeApi';
import { shareApi } from '../../features/engagement/shareApi';
import { commentApi } from '../../features/engagement/commentApi';
import { playlistApi } from '../../features/playlist/playlistApi';
import { bookmarkApi } from '../../features/engagement/bookmarkApi';
import { notificationApi } from '../../features/notification/notificationApi';
import { conversationApi } from '../../features/message/conversationApi';
import { messageApi } from '../../features/message/messageApi';

const RESETTABLE_APIS = [
  authApi,
  videoApi,
  shortApi,
  postApi,
  creatorApi,
  uploadApi,
  feedApi,
  preferencesApi,
  settingsApi,
  accountApi,
  searchApi,
  historyApi,
  reportApi,
  juryApi,
  followApi,
  blockApi,
  likeApi,
  shareApi,
  commentApi,
  playlistApi,
  bookmarkApi,
  notificationApi,
  conversationApi,
  messageApi,
];

interface IdentityMiddlewareState {
  auth: { user: { id: string } | null };
}

export const apiCacheResetMiddleware: Middleware<
  object,
  IdentityMiddlewareState
> = (store) => (next) => (action) => {
  const previousUserId = store.getState().auth.user?.id ?? null;
  const result = next(action);
  const nextUserId = store.getState().auth.user?.id ?? null;

  if (previousUserId !== nextUserId) {
    for (const api of RESETTABLE_APIS) {
      store.dispatch(api.util.resetApiState());
    }
  }

  return result;
};
