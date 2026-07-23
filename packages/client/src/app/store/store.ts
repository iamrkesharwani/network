import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { type RootState as RootReducerState } from './rootReducer';
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
import { preferencesSyncMiddleware } from '../../features/settings/preferencesSyncMiddleware';
import { messageKeyLogoutMiddleware } from '../../features/message/messageKeyLogoutMiddleware';
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
import { keyBundleApi } from '../../features/message/keyBundleApi';
import { conversationApi } from '../../features/message/conversationApi';
import { messageApi } from '../../features/message/messageApi';

export const createAppStore =(preloadedState?: Partial<RootReducerState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['messageKey/setPrivateKey'],
          ignoredPaths: ['messageKey.privateKey'],
        },
      }).concat(
        authApi.middleware,
        videoApi.middleware,
        shortApi.middleware,
        postApi.middleware,
        creatorApi.middleware,
        uploadApi.middleware,
        feedApi.middleware,
        preferencesApi.middleware,
        settingsApi.middleware,
        accountApi.middleware,
        searchApi.middleware,
        historyApi.middleware,
        reportApi.middleware,
        juryApi.middleware,
        followApi.middleware,
        blockApi.middleware,
        likeApi.middleware,
        shareApi.middleware,
        commentApi.middleware,
        playlistApi.middleware,
        bookmarkApi.middleware,
        notificationApi.middleware,
        keyBundleApi.middleware,
        conversationApi.middleware,
        messageApi.middleware,
        preferencesSyncMiddleware,
        messageKeyLogoutMiddleware
      ),
    devTools: import.meta.env.MODE !== 'production',
  });

const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export default store;
