import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes/route.js';
import { API_V1_PREFIX } from '@network/shared';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import {
  generateCsrfToken,
  validateCsrfToken,
} from './middleware/csrf.middleware.js';
import type { Application, Request, Response, NextFunction } from 'express';
import { sanitizeMiddleware } from './middleware/sanitize.middleware.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import sirv from 'sirv';
import type { ViteDevServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = env.NODE_ENV === 'production';
const base = env.BASE_URL;
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
  `${API_V1_PREFIX}/videos/webhook`,
  express.raw({ type: 'application/json', limit: '1mb' }),
  (req: Request, _res: Response, next: NextFunction) => {
    req.rawBody = req.body as Buffer;
    next();
  }
);

app.use(
  express.json({
    limit: '10kb',
    verify: (req: Request, _res, buf) => {
      if (req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitizeMiddleware);
app.use(apiLimiter);
app.use(compression());
app.get(`${API_V1_PREFIX}/csrf-token`, generateCsrfToken);
app.use(API_V1_PREFIX, validateCsrfToken, routes);

const setupSSR = async () => {
  let vite: ViteDevServer | undefined;
  let prodTemplate: string | undefined;
  let prodRender: ((url: string) => Promise<{ html: string }>) | undefined;

  if (!isProduction) {
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
      root: path.resolve(__dirname, '../../client'),
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      sirv(path.resolve(__dirname, '../../client/dist/client'), {
        extensions: [],
      })
    );
    prodTemplate = fs.readFileSync(
      path.resolve(__dirname, '../../client/dist/client/index.html'),
      'utf-8'
    );
    const module = await import('../../client/dist/server/entry-server.js');
    prodRender = module.render;
  }

  app.use(
    '/{*splat}',
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith(API_V1_PREFIX)) {
        return next();
      }

      try {
        const url = req.originalUrl.replace(base, '');
        let template: string;
        let render: (url: string) => Promise<{ html: string }>;

        if (!isProduction && vite) {
          template = fs.readFileSync(
            path.resolve(__dirname, '../../client/index.html'),
            'utf-8'
          );
          template = await vite.transformIndexHtml(url, template);
          const module = await vite.ssrLoadModule('/src/entry-server.tsx');
          render = module['render'];
        } else {
          template = prodTemplate!;
          render = prodRender!;
        }

        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const rendered = await render(fullUrl);

        if (!template.includes('<!--ssr-outlet-->')) {
          throw new Error(
            'SSR outlet marker <!--ssr-outlet--> not found in index.html template'
          );
        }
        const html = template.replace('<!--ssr-outlet-->', rendered.html ?? '');

        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (error: unknown) {
        if (!isProduction && vite && error instanceof Error) {
          vite.ssrFixStacktrace(error);
        }
        next(error);
      }
    }
  );

  app.use(errorHandler);
};

setupSSR();

export default app;
