import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { usernameParamSchema, blockListQuerySchema } from '@network/shared';
import * as blockController from './block.controller.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  validate({ query: blockListQuerySchema }),
  blockController.listBlockedUsersHandler
);

router.put(
  '/:username',
  requireAuth,
  validate({ params: usernameParamSchema }),
  blockController.blockUserHandler
);

router.delete(
  '/:username',
  requireAuth,
  validate({ params: usernameParamSchema }),
  blockController.unblockUserHandler
);

export default router;
