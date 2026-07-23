import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { optionalAuth } from '../../core/middleware/auth.middleware.js';
import { unifiedFeedQuerySchema } from '@network/shared';
import * as feedController from './feed.controller.js';

const router = Router();

router.get(
  '/',
  optionalAuth,
  validate({ query: unifiedFeedQuerySchema }),
  feedController.getFeed
);

export default router;
