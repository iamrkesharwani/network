import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { likeLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { likeToggleSchema, likeStatusQuerySchema } from '@network/shared';
import * as likeController from './like.controller.js';

const router = Router();

router.post(
  '/toggle',
  requireAuth,
  likeLimiter,
  validate({ body: likeToggleSchema }),
  likeController.toggle
);

router.get(
  '/status',
  requireAuth,
  validate({ query: likeStatusQuerySchema }),
  likeController.status
);

export default router;
