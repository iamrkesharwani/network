import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { reportLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { reportCreateSchema, reportMineQuerySchema } from '@network/shared';
import * as reportController from './report.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  reportLimiter,
  validate({ body: reportCreateSchema }),
  reportController.create
);

router.get(
  '/mine',
  requireAuth,
  validate({ query: reportMineQuerySchema }),
  reportController.listMine
);

export default router;
