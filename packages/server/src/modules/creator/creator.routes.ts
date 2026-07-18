import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { validate } from '../../core/middleware/validate.middleware.js';
import { usernameParamSchema } from '@network/shared';
import * as creatorController from './creator.controller.js';

const router = Router();

router.get('/me', requireAuth, creatorController.getMyProfile);
router.get('/catalog', creatorController.getCatalog);
router.get(
  '/:username',
  optionalAuth,
  validate({ params: usernameParamSchema }),
  creatorController.getPublicProfileByUsername
);

export default router;
