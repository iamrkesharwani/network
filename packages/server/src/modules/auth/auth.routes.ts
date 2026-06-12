import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import {
  loginSchema,
  userRegistrationSchema,
  verifyEmailSchema,
} from '@network/shared';
import * as authController from './auth.controller.js';

const router = Router();

router.post(
  '/register',
  validate({ body: userRegistrationSchema }),
  authController.registerLocal
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  authController.loginLocal
);

router.post('/refresh', authController.refreshTokens);

router.post('/logout', authController.logout);

router.post('/send-verification', authController.requestEmailVerification);

router.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail
);

export default router;
