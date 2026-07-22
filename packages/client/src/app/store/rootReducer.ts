import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import videoReducer from '../../features/video/videoSlice';
import shortReducer from '../../features/short/shortSlice';
import uploadReducer from '../../features/upload/uploadSlice';
import playerReducer from '../../features/player/store/playerSlice';
import preferencesReducer from '../../features/settings/preferencesSlice';
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
import { likeApi } from '../../features/engagement/likeApi';
import { shareApi } from '../../features/engagement/shareApi';
import { commentApi } from '../../features/engagement/commentApi';
import { playlistApi } from '../../features/playlist/playlistApi';
import { bookmarkApi } from '../../features/engagement/bookmarkApi';
import { notificationApi } from '../../features/notification/notificationApi';

const rootReducer = combineReducers({
  auth: authReducer,
  video: videoReducer,
  short: shortReducer,
  upload: uploadReducer,
  player: playerReducer,
  preferences: preferencesReducer,
  [authApi.reducerPath]: authApi.reducer,
  [videoApi.reducerPath]: videoApi.reducer,
  [shortApi.reducerPath]: shortApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [creatorApi.reducerPath]: creatorApi.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
  [feedApi.reducerPath]: feedApi.reducer,
  [preferencesApi.reducerPath]: preferencesApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [searchApi.reducerPath]: searchApi.reducer,
  [historyApi.reducerPath]: historyApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer,
  [juryApi.reducerPath]: juryApi.reducer,
  [followApi.reducerPath]: followApi.reducer,
  [likeApi.reducerPath]: likeApi.reducer,
  [shareApi.reducerPath]: shareApi.reducer,
  [commentApi.reducerPath]: commentApi.reducer,
  [playlistApi.reducerPath]: playlistApi.reducer,
  [bookmarkApi.reducerPath]: bookmarkApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
