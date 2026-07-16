import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import {
  authLimiter,
  otpLimiter,
} from '../../core/middleware/rateLimit.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import {
  loginSchema,
  userRegistrationSchema,
  verifyEmailSchema,
  changePasswordSchema,
  changeEmailSchema,
  confirmEmailChangeSchema,
  confirmAddPasswordSchema,
  requestResetPasswordSchema,
  completeResetPasswordSchema,
} from '@network/shared';

import * as authCoreController from './controllers/auth.core.controller.js';
import * as authPasswordController from './controllers/auth.password.controller.js';
import * as authVerifyController from './controllers/auth.verify.controller.js';
import * as authEmailChangeController from './controllers/auth.emailChange.controller.js';
import {
  googleCallback,
  googleRedirect,
} from './oauth/google.oauth.controller.js';

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

router.post('/refresh', authLimiter, authCoreController.refreshTokens);

router.post('/logout', authLimiter, authCoreController.logout);

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
  '/change-email/request',
  requireAuth,
  authLimiter,
  validate({ body: changeEmailSchema }),
  authEmailChangeController.requestEmailChange
);

router.post(
  '/change-email/confirm',
  requireAuth,
  authLimiter,
  validate({ body: confirmEmailChangeSchema }),
  authEmailChangeController.confirmEmailChange
);

router.post(
  '/add-password/request',
  requireAuth,
  authLimiter,
  authPasswordController.requestAddPassword
);

router.post(
  '/add-password/confirm',
  requireAuth,
  authLimiter,
  validate({ body: confirmAddPasswordSchema }),
  authPasswordController.confirmAddPassword
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

router.get('/google', authLimiter, googleRedirect);
router.get('/google/callback', googleCallback);

export default router;
