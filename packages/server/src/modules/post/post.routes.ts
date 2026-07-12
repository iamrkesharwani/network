import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { uploadLimiter } from '../../core/middleware/rateLimit.middleware.js';
import { uploadPostImage } from '../../core/middleware/upload.middleware.js';
import {
  createPostSchema,
  postUpdateSchema,
  postFeedQuerySchema,
  postIdParamSchema,
  postUserFeedQuerySchema,
  usernameParamSchema,
} from '@network/shared';

import * as postCrudController from './controllers/crud.controller.js';
import * as postUploadController from './controllers/upload.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  uploadLimiter,
  uploadPostImage,
  validate({ body: createPostSchema }),
  postUploadController.createThePost
);

router.get(
  '/feed',
  validate({ query: postFeedQuerySchema }),
  postCrudController.getFeed
);

router.get(
  '/mine',
  requireAuth,
  validate({ query: postFeedQuerySchema }),
  postCrudController.getMine
);

router.get(
  '/user/:username',
  optionalAuth,
  validate({ params: usernameParamSchema, query: postUserFeedQuerySchema }),
  postCrudController.getByUsername
);

router.get(
  '/:postId',
  optionalAuth,
  validate({ params: postIdParamSchema }),
  postCrudController.getById
);

router.patch(
  '/:postId',
  requireAuth,
  validate({ params: postIdParamSchema, body: postUpdateSchema }),
  postCrudController.update
);

router.delete(
  '/:postId',
  requireAuth,
  validate({ params: postIdParamSchema }),
  postCrudController.remove
);

export default router;
