import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';
import { uploadLimiter } from '../../middleware/rateLimit.middleware.js';
import { uploadThumbnail } from '../../middleware/upload.middleware.js';
import {
  initiateVideoUploadSchema,
  confirmVideoUploadSchema,
  videoUploadSchema,
  videoUpdateSchema,
  videoFeedQuerySchema,
  videoIdParamSchema,
} from '@network/shared';

import * as videoCrudController from './controllers/crud.controller.js';
import * as videoUploadController from './controllers/upload.controller.js';

const router = Router();

router.post(
  '/initiate-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: initiateVideoUploadSchema }),
  videoUploadController.initiateUpload
);

router.post(
  '/confirm-upload',
  requireAuth,
  uploadLimiter,
  validate({ body: confirmVideoUploadSchema }),
  videoUploadController.confirmUpload
);

router.post(
  '/thumbnail',
  requireAuth,
  uploadLimiter,
  uploadThumbnail,
  videoUploadController.uploadThumbnail
);

router.post(
  '/:videoId/finalise',
  requireAuth,
  uploadLimiter,
  validate({ params: videoIdParamSchema, body: videoUploadSchema }),
  videoUploadController.finaliseVideo
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
