import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';
import {
  keyBundlePublishSchema,
  keyBundlePublicKeysQuerySchema,
  keyBundleUserIdParamSchema,
} from '@network/shared';
import * as keyBundleController from '../controllers/keyBundle.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  validate({ body: keyBundlePublishSchema }),
  keyBundleController.publish
);

router.get('/me', requireAuth, keyBundleController.getMine);

router.get(
  '/public',
  requireAuth,
  validate({ query: keyBundlePublicKeysQuerySchema }),
  keyBundleController.getPublicKeys
);

router.get(
  '/:userId/public',
  requireAuth,
  validate({ params: keyBundleUserIdParamSchema }),
  keyBundleController.getPublicKey
);

export default router;
