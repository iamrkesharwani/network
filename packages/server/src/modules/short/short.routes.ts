import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';
import { uploadLimiter } from '../../middleware/rateLimit.middleware.js';
import { uploadThumbnail } from '../../middleware/upload.middleware.js';
import {
  initiateShortUploadSchema,
  confirmShortUploadSchema,
  shortUploadSchema,
  shortUpdateSchema,
  shortFeedQuerySchema,
  shortIdParamSchema,
} from '@network/shared';

import * as shortCrudController from './controllers/crud.controller.js';
import * as shortUploadController from './controllers/upload.controller.js';

const router = Router();

router.post(
  '/initiate-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: initiateShortUploadSchema }),
  shortUploadController.initiateUpload
);

router.post(
  '/confirm-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: confirmShortUploadSchema }),
  shortUploadController.confirmUpload
);

router.post(
  '/thumbnail',
  requireAuth,
  uploadLimiter,
  uploadThumbnail,
  shortUploadController.uploadThumbnail
);

router.post(
  '/:shortId/finalise',
  requireAuth,
  uploadLimiter,
  validate({ params: shortIdParamSchema, body: shortUploadSchema }),
  shortUploadController.finaliseShort
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
