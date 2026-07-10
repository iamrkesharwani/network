import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import routes from './route.js';
import { API_V1_PREFIX, HSTS_MAX_AGE_SECONDS } from '@network/shared';
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

app.set('trust proxy', env.TRUST_PROXY_HOPS);

app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            mediaSrc: ["'self'", 'https:'],
            connectSrc: ["'self'", env.CLIENT_URL],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'self'"],
          },
        }
      : false,
    hsts: isProduction
      ? {
          maxAge: HSTS_MAX_AGE_SECONDS,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

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
