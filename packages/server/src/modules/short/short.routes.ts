import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { uploadLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { uploadThumbnail } from '../../core/middleware/upload.middleware.js';
import {
  initiateShortUploadSchema,
  confirmShortUploadSchema,
  shortUploadSchema,
  shortUpdateSchema,
  shortFeedQuerySchema,
  shortIdParamSchema,
  shortUserFeedQuerySchema,
  usernameParamSchema,
} from '@network/shared';

import * as shortCrudController from './controllers/crud.controller.js';
import * as shortUploadController from './controllers/upload.controller.js';

const router = Router();

router.post(
  '/initiate-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: initiateShortUploadSchema }),
  shortUploadController.initiateTheUpload
);

router.post(
  '/confirm-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: confirmShortUploadSchema }),
  shortUploadController.confirmTheUpload
);

router.post(
  '/thumbnail',
  requireAuth,
  uploadLimiter,
  uploadThumbnail,
  shortUploadController.uploadTheThumbnail
);

router.post(
  '/:shortId/finalise',
  requireAuth,
  uploadLimiter,
  validate({ params: shortIdParamSchema, body: shortUploadSchema }),
  shortUploadController.finaliseTheShort
);

router.get(
  '/feed',
  validate({ query: shortFeedQuerySchema }),
  shortCrudController.getFeed
);

router.get(
  '/mine',
  requireAuth,
  validate({ query: shortFeedQuerySchema }),
  shortCrudController.getMine
);

router.get(
  '/user/:username/visibility-counts',
  requireAuth,
  validate({ params: usernameParamSchema }),
  shortCrudController.getVisibilityCounts
);

router.get(
  '/user/:username',
  optionalAuth,
  validate({ params: usernameParamSchema, query: shortUserFeedQuerySchema }),
  shortCrudController.getByUsername
);

router.get(
  '/:shortId',
  optionalAuth,
  validate({ params: shortIdParamSchema }),
  shortCrudController.getById
);

router.patch(
  '/:shortId',
  requireAuth,
  validate({ params: shortIdParamSchema, body: shortUpdateSchema }),
  shortCrudController.update
);

router.delete(
  '/:shortId',
  requireAuth,
  validate({ params: shortIdParamSchema }),
  shortCrudController.remove
);

export default router;
