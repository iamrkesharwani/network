import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { type RootState as RootReducerState } from './rootReducer';
import { authApi } from '../features/auth/authApi';

export const createAppStore = (preloadedState?: Partial<RootReducerState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
    devTools: import.meta.env.MODE !== 'production',
  });

const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export default store;
