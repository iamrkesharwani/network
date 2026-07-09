import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import routes from './route.js';
import { API_V1_PREFIX } from '@network/shared';
import { env } from './core/env/env.js';
import { apiLimiter } from './core/middleware/rateLimit.middleware.js';
import {
  generateCsrfToken,
  validateCsrfToken,
} from './core/middleware/csrf.middleware.js';
import { sanitizeMiddleware } from './core/middleware/sanitize.middleware.js';
import { rawWebhookBody } from './core/config/webhookRawBody.js';
import { setupSSR } from './core/config/viteSSR.js';
import type { Application } from 'express';

const isProduction = env.NODE_ENV === 'production';
const app: Application = express();

app.set('trust proxy', parseInt(env.TRUST_PROXY_HOPS, 10));

if (!isProduction) {
  app.use(helmet({ contentSecurityPolicy: false }));
} else {
  app.use(helmet());
}

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  `${API_V1_PREFIX}/webhook/media`,
  express.raw({ type: 'application/json', limit: '1mb' }),
  rawWebhookBody
);

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitizeMiddleware);
app.use(apiLimiter);
app.use(compression());
app.get(`${API_V1_PREFIX}/csrf-token`, generateCsrfToken);
app.use(API_V1_PREFIX, validateCsrfToken, routes);

setupSSR(app);

export default app;
