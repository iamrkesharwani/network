import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { type RootState as RootReducerState } from './rootReducer';
import { authApi } from '../features/auth/authApi';
import { videoApi } from '../features/video/videoApi';
import { shortApi } from '../features/short/shortApi';

export const createAppStore = (preloadedState?: Partial<RootReducerState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        videoApi.middleware,
        shortApi.middleware
      ),
    devTools: import.meta.env.MODE !== 'production',
  });

const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export default store;
