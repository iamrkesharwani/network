import '@fontsource-variable/archivo';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createAppStore } from './store/store';
import App from './App';
import './index.css';
import { routes } from './routes/AppRoutes';
import SessionResolver from './shared/lib/sessionResolver';

const store = createAppStore({
  auth: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  },
});

const router = createBrowserRouter(routes);

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <Provider store={store}>
      <App>
        <SessionResolver store={store} />
        <RouterProvider router={router} />
      </App>
    </Provider>
  </StrictMode>
);
