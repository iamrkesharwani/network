import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';
import { otpLimiter } from '../../../core/middleware/rateLimit.middleware.js';
import {
  keyBundlePublishSchema,
  keyBundlePublicKeysQuerySchema,
  keyBundleUserIdParamSchema,
  keyOtpConfirmSchema,
  keyRecoveryConfirmSchema,
} from '@network/shared';
import * as keyBundleController from '../controllers/keyBundle.controller.js';
import * as keyOtpController from '../controllers/keyOtp.controller.js';
import * as keyRecoveryController from '../controllers/keyRecovery.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  validate({ body: keyBundlePublishSchema }),
  keyBundleController.publish
);

router.get('/me', requireAuth, keyBundleController.getMine);

router.post(
  '/otp/request',
  requireAuth,
  otpLimiter,
  keyOtpController.requestOtp
);

router.post(
  '/otp/confirm',
  requireAuth,
  otpLimiter,
  validate({ body: keyOtpConfirmSchema }),
  keyOtpController.confirmOtp
);

router.post(
  '/recovery/confirm',
  requireAuth,
  otpLimiter,
  validate({ body: keyRecoveryConfirmSchema }),
  keyRecoveryController.confirmRecovery
);

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
