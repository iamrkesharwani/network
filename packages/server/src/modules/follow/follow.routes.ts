import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { followLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { usernameParamSchema, followListQuerySchema } from '@network/shared';
import * as followController from './follow.controller.js';

const router = Router();

router.put(
  '/:username',
  requireAuth,
  followLimiter,
  validate({ params: usernameParamSchema }),
  followController.followUser
);

router.delete(
  '/:username',
  requireAuth,
  followLimiter,
  validate({ params: usernameParamSchema }),
  followController.unfollowUser
);

router.delete(
  '/followers/:username',
  requireAuth,
  followLimiter,
  validate({ params: usernameParamSchema }),
  followController.removeFollower
);

router.get(
  '/:username/followers',
  optionalAuth,
  validate({ params: usernameParamSchema, query: followListQuerySchema }),
  followController.listFollowers
);

router.get(
  '/:username/following',
  optionalAuth,
  validate({ params: usernameParamSchema, query: followListQuerySchema }),
  followController.listFollowing
);

export default router;
