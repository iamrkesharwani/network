import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { uploadLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../../core/middleware/upload.middleware.js';
import {
  basicProfileSchema,
  personalDetailsSchema,
  contactLinksSchema,
  captureLocationSchema,
} from '@network/shared';
import * as profileController from './controllers/profile.controller.js';
import * as locationController from './controllers/location.controller.js';

const router = Router();

router.patch(
  '/profile/basic',
  requireAuth,
  validate({ body: basicProfileSchema }),
  profileController.patchBasicProfile
);

router.patch(
  '/profile/personal',
  requireAuth,
  validate({ body: personalDetailsSchema }),
  profileController.patchPersonalDetails
);

router.patch(
  '/profile/contact',
  requireAuth,
  validate({ body: contactLinksSchema }),
  profileController.patchContactLinks
);

router.post(
  '/profile/avatar',
  requireAuth,
  uploadLimiter,
  uploadAvatarMiddleware,
  profileController.uploadAvatar
);

router.post(
  '/location/capture',
  requireAuth,
  validate({ body: captureLocationSchema }),
  locationController.captureLocation
);

export default router;
