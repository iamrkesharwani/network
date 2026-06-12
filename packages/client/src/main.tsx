import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import App from './App';
import './index.css';
import {
  fetchCsrfToken,
  setAccessToken,
  axiosInstance,
} from './shared/lib/axiosInstance';
import { setToken, setInitialized } from './features/auth/authSlice';

const bootstrap = async () => {
  await fetchCsrfToken();
  try {
    const { data } = await axiosInstance.post<{
      data: { accessToken: string };
    }>('/auth/refresh');
    const accessToken = data.data.accessToken;
    setAccessToken(accessToken);
    store.dispatch(setToken(accessToken));
  } catch {
    setAccessToken(null);
    store.dispatch(setToken(null));
  } finally {
    store.dispatch(setInitialized());
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  );
};

bootstrap();
