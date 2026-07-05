import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { API_V1_PREFIX } from '@network/shared';
import { env } from '../env/env.js';
import { errorHandler } from '../middleware/error.middleware.js';
import type { Application, Request, Response, NextFunction } from 'express';
import type { ViteDevServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = env.NODE_ENV === 'production';
const base = env.BASE_URL;

const clientRoot = path.resolve(__dirname, '../../../client');

export const setupSSR = async (app: Application): Promise<void> => {
  let vite: ViteDevServer | undefined;
  let prodTemplate: string | undefined;
  let prodRender: ((url: string) => Promise<{ html: string }>) | undefined;

  if (!isProduction) {
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
      root: clientRoot,
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      sirv(path.resolve(clientRoot, 'dist/client'), {
        extensions: [],
      })
    );
    prodTemplate = fs.readFileSync(
      path.resolve(clientRoot, 'dist/client/index.html'),
      'utf-8'
    );
    const module = await import('../../../client/dist/server/entry-server.js');
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
            path.resolve(clientRoot, 'index.html'),
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
