import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import videoReducer from '../features/video/videoSlice';
import { authApi } from '../features/auth/authApi';
import { videoApi } from '../features/video/videoApi';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  video: videoReducer,
  [authApi.reducerPath]: authApi.reducer,
  [videoApi.reducerPath]: videoApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
