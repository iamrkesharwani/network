import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import {
  authLimiter,
  otpLimiter,
} from '../../middleware/rateLimit.middleware.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  loginSchema,
  userRegistrationSchema,
  verifyEmailSchema,
  changePasswordSchema,
  requestResetPasswordSchema,
  completeResetPasswordSchema,
} from '@network/shared';

import * as authCoreController from './controllers/auth.core.controller.js';
import * as authPasswordController from './controllers/auth.password.controller.js';
import * as authVerifyController from './controllers/auth.verify.controller.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: userRegistrationSchema }),
  authCoreController.registerLocal
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authCoreController.loginLocal
);

router.post('/refresh', authCoreController.refreshTokens);

router.post('/logout', authCoreController.logout);

router.post(
  '/send-verification',
  otpLimiter,
  authVerifyController.requestEmailVerification
);

router.post(
  '/verify-email',
  otpLimiter,
  validate({ body: verifyEmailSchema }),
  authVerifyController.verifyEmail
);

router.post(
  '/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  authPasswordController.changePassword
);

router.post(
  '/request-password-reset',
  otpLimiter,
  validate({ body: requestResetPasswordSchema }),
  authPasswordController.requestPasswordReset
);

router.post(
  '/reset-password',
  otpLimiter,
  validate({ body: completeResetPasswordSchema }),
  authPasswordController.completePasswordReset
);

export default router;
