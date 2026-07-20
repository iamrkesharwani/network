import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { commentLimiter } from '../../core/middleware/rateLimit.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
  commentListQuerySchema,
  commentIdParamSchema,
} from '@network/shared';
import * as commentController from './comment.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  commentLimiter,
  validate({ body: createCommentSchema }),
  commentController.create
);

router.get(
  '/',
  optionalAuth,
  validate({ query: commentListQuerySchema }),
  commentController.list
);

router.patch(
  '/:commentId',
  requireAuth,
  validate({ params: commentIdParamSchema, body: updateCommentSchema }),
  commentController.update
);

router.delete(
  '/:commentId',
  requireAuth,
  validate({ params: commentIdParamSchema }),
  commentController.remove
);

export default router;
