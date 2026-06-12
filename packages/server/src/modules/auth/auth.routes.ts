import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import {
  loginSchema,
  userRegistrationSchema,
  verifyEmailSchema,
} from '@network/shared';
import * as authController from './auth.controller.js';
import {
  authLimiter,
  otpLimiter,
} from '../../middleware/rateLimit.middleware.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: userRegistrationSchema }),
  authController.registerLocal
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.loginLocal
);

router.post('/refresh', authController.refreshTokens);

router.post('/logout', authController.logout);

router.post(
  '/send-verification',
  otpLimiter,
  authController.requestEmailVerification
);

router.post(
  '/verify-email',
  otpLimiter,
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail
);

export default router;
