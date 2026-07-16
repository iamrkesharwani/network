import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { authLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { deactivateAccountSchema, deleteAccountSchema } from '@network/shared';
import * as accountController from './controllers/account.controller.js';

const router = Router();

router.post(
  '/deactivate',
  requireAuth,
  authLimiter,
  validate({ body: deactivateAccountSchema }),
  accountController.deactivate
);

router.post(
  '/reactivate',
  requireAuth,
  authLimiter,
  accountController.reactivate
);

router.post(
  '/delete',
  requireAuth,
  authLimiter,
  validate({ body: deleteAccountSchema }),
  accountController.deleteAccount
);

export default router;
