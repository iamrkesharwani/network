import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { uploadLimiter } from '../../middleware/rateLimit.middleware.js';
import {
  initiateMultipartUploadSchema,
  resumeMultipartUploadSchema,
  multipartSessionIdParamSchema,
  presignPartParamSchema,
  completePartSchema,
  completeMultipartUploadSchema,
} from '@network/shared';

import * as uploadController from './upload.controller.js';

const router = Router();

router.post(
  '/initiate',
  requireAuth,
  uploadLimiter,
  validate({ body: initiateMultipartUploadSchema }),
  uploadController.initiate
);

router.post(
  '/resume',
  requireAuth,
  uploadLimiter,
  validate({ body: resumeMultipartUploadSchema }),
  uploadController.resume
);

router.get(
  '/:sessionId/parts/:partNumber',
  requireAuth,
  uploadLimiter,
  validate({ params: presignPartParamSchema }),
  uploadController.presignPart
);

router.post(
  '/:sessionId/parts/:partNumber',
  requireAuth,
  uploadLimiter,
  validate({ params: presignPartParamSchema, body: completePartSchema }),
  uploadController.completePart
);

router.post(
  '/:sessionId/complete',
  requireAuth,
  uploadLimiter,
  validate({
    params: multipartSessionIdParamSchema,
    body: completeMultipartUploadSchema,
  }),
  uploadController.complete
);

router.post(
  '/:sessionId/abort',
  requireAuth,
  uploadLimiter,
  validate({ params: multipartSessionIdParamSchema }),
  uploadController.abort
);

export default router;
