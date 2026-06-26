import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router';
import { Provider } from 'react-redux';
import { createAppStore } from './store/store';
import App from './App';
import { routes } from './routes/AppRoutes';

export async function render(url: string) {
  const store = createAppStore({
    auth: {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,
    },
  });

  const { query, dataRoutes } = createStaticHandler(routes);
  const fetchRequest = new Request(url);
  const context = await query(fetchRequest);

  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(dataRoutes, context);

  const html = renderToString(
    <StrictMode>
      <Provider store={store}>
        <App>
          <StaticRouterProvider router={router} context={context} />
        </App>
      </Provider>
    </StrictMode>
  );

  return { html };
}
