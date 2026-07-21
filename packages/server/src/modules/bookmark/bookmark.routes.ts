import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { bookmarkLimiter } from '../../core/middleware/rateLimit.middleware.js';
import {
  bookmarkToggleSchema,
  bookmarkStatusQuerySchema,
  bookmarkFeedQuerySchema,
} from '@network/shared';
import * as bookmarkController from './bookmark.controller.js';

const router = Router();

router.post(
  '/toggle',
  requireAuth,
  bookmarkLimiter,
  validate({ body: bookmarkToggleSchema }),
  bookmarkController.toggle
);

router.get(
  '/status',
  requireAuth,
  validate({ query: bookmarkStatusQuerySchema }),
  bookmarkController.status
);

router.get(
  '/',
  requireAuth,
  validate({ query: bookmarkFeedQuerySchema }),
  bookmarkController.list
);

export default router;
