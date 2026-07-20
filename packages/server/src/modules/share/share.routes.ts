import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { optionalAuth } from '../../core/middleware/auth.middleware.js';
import { shareLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { shareCreateSchema } from '@network/shared';
import * as shareController from './share.controller.js';

const router = Router();

router.post(
  '/',
  optionalAuth,
  shareLimiter,
  validate({ body: shareCreateSchema }),
  shareController.create
);

export default router;
