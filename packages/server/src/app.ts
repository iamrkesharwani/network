import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { API_V1_PREFIX } from '@network/shared';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import {
  generateCsrfToken,
  validateCsrfToken,
} from './middleware/csrf.middleware.js';
import type { Application, Request, Response } from 'express';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(apiLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
  });
});

app.get(`${API_V1_PREFIX}/csrf-token`, generateCsrfToken);
app.use(validateCsrfToken);

app.use(API_V1_PREFIX, routes);
app.use(errorHandler);

export default app;
