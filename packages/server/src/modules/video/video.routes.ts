import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { uploadLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { uploadThumbnail } from '../../core/middleware/upload.middleware.js';
import {
  initiateVideoUploadSchema,
  confirmVideoUploadSchema,
  videoUploadSchema,
  videoUpdateSchema,
  videoFeedQuerySchema,
  videoIdParamSchema,
  videoUserFeedQuerySchema,
  usernameParamSchema,
} from '@network/shared';

import * as videoCrudController from './controllers/crud.controller.js';
import * as videoUploadController from './controllers/upload.controller.js';

const router = Router();

router.post(
  '/initiate-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: initiateVideoUploadSchema }),
  videoUploadController.initiateTheUpload
);

router.post(
  '/confirm-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: confirmVideoUploadSchema }),
  videoUploadController.confirmTheUpload
);

router.post(
  '/thumbnail',
  requireAuth,
  uploadLimiter,
  uploadThumbnail,
  videoUploadController.uploadTheThumbnail
);

router.post(
  '/:videoId/finalise',
  requireAuth,
  uploadLimiter,
  validate({ params: videoIdParamSchema, body: videoUploadSchema }),
  videoUploadController.finaliseTheVideo
);

router.get(
  '/feed',
  validate({ query: videoFeedQuerySchema }),
  videoCrudController.getFeed
);

router.get(
  '/mine',
  requireAuth,
  validate({ query: videoFeedQuerySchema }),
  videoCrudController.getMine
);

router.get(
  '/user/:username',
  optionalAuth,
  validate({ params: usernameParamSchema, query: videoUserFeedQuerySchema }),
  videoCrudController.getByUsername
);

router.get(
  '/:videoId',
  optionalAuth,
  validate({ params: videoIdParamSchema }),
  videoCrudController.getById
);

router.patch(
  '/:videoId',
  requireAuth,
  validate({ params: videoIdParamSchema, body: videoUpdateSchema }),
  videoCrudController.update
);

router.delete(
  '/:videoId',
  requireAuth,
  validate({ params: videoIdParamSchema }),
  videoCrudController.remove
);

export default router;
