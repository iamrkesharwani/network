import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import {
  historyProgressSchema,
  historyContentParamSchema,
  historyIdParamSchema,
  historyFeedQuerySchema,
} from '@network/shared';
import * as historyController from './controllers/history.controller.js';

const router = Router();

router.post(
  '/progress',
  requireAuth,
  validate({ body: historyProgressSchema }),
  historyController.recordProgress
);

router.get(
  '/',
  requireAuth,
  validate({ query: historyFeedQuerySchema }),
  historyController.list
);

router.get(
  '/:contentType/:contentId/resume',
  requireAuth,
  validate({ params: historyContentParamSchema }),
  historyController.getResume
);

router.delete(
  '/:historyId',
  requireAuth,
  validate({ params: historyIdParamSchema }),
  historyController.remove
);

router.delete('/', requireAuth, historyController.clear);

export default router;
