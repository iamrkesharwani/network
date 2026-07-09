import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import uiReducer from '../../features/ui/uiSlice';
import videoReducer from '../../features/video/videoSlice';
import shortReducer from '../../features/short/shortSlice';
import uploadReducer from '../../features/upload/uploadSlice';
import { authApi } from '../../features/auth/authApi';
import { videoApi } from '../../features/video/videoApi';
import { shortApi } from '../../features/short/shortApi';
import { postApi } from '../../features/post/postApi';
import { creatorApi } from '../../features/creator/creatorApi';
import { uploadApi } from '../../features/upload/uploadApi';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  video: videoReducer,
  short: shortReducer,
  upload: uploadReducer,
  [authApi.reducerPath]: authApi.reducer,
  [videoApi.reducerPath]: videoApi.reducer,
  [shortApi.reducerPath]: shortApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [creatorApi.reducerPath]: creatorApi.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
