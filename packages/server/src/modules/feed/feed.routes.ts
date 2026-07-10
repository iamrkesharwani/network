import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { unifiedFeedQuerySchema } from '@network/shared';
import * as feedController from './feed.controller.js';

const router = Router();

router.get(
  '/',
  validate({ query: unifiedFeedQuerySchema }),
  feedController.getFeed
);

export default router;
