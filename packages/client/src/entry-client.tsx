import '@fontsource-variable/archivo';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import { StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createAppStore } from './store/store';
import App from './App';
import './index.css';
import { routes } from './routes/AppRoutes';
import {
  fetchCsrfToken,
  setAccessToken,
  axiosInstance,
} from './shared/lib/axiosInstance';
import {
  setCredentials,
  clearCredentials,
  setInitialized,
} from './features/auth/authSlice';
import type { IUser } from '@network/shared';

const store = createAppStore({
  auth: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  },
});

const router = createBrowserRouter(routes);

const SessionResolver = () => {
  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      await fetchCsrfToken();
      try {
        const { data } = await axiosInstance.post<{
          data: { accessToken: string; user: IUser };
        }>('/auth/refresh');

        if (!isMounted) return;

        const { accessToken, user } = data.data;

        setAccessToken(accessToken);
        store.dispatch(setCredentials({ user, accessToken }));
      } catch {
        if (!isMounted) return;

        setAccessToken(null);
        store.dispatch(clearCredentials());
      } finally {
        if (isMounted) {
          store.dispatch(setInitialized());
        }
      }
    };

    resolveSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <Provider store={store}>
      <App>
        <SessionResolver />
        <RouterProvider router={router} />
      </App>
    </Provider>
  </StrictMode>
);
