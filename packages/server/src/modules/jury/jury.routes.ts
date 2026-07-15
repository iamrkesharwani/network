import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, requireRole } from '../../core/middleware/auth.middleware.js';
import {
  juryVoteSchema,
  juryCaseIdParamSchema,
  juryAppealCreateSchema,
  juryAppealIdParamSchema,
  juryAppealResolveSchema,
  juryMineQuerySchema,
} from '@network/shared';
import * as juryController from './jury.controller.js';

const router = Router();

router.get('/assigned', requireAuth, juryController.listAssigned);

router.get(
  '/cases/:caseId',
  requireAuth,
  validate({ params: juryCaseIdParamSchema }),
  juryController.getCase
);

router.post(
  '/cases/:caseId/vote',
  requireAuth,
  validate({ params: juryCaseIdParamSchema, body: juryVoteSchema }),
  juryController.vote
);

router.post(
  '/appeals',
  requireAuth,
  validate({ body: juryAppealCreateSchema }),
  juryController.createAppealHandler
);

router.get(
  '/appeals/mine',
  requireAuth,
  validate({ query: juryMineQuerySchema }),
  juryController.listMyAppeals
);

router.patch(
  '/appeals/:appealId/resolve',
  requireAuth,
  requireRole(['admin']),
  validate({ params: juryAppealIdParamSchema, body: juryAppealResolveSchema }),
  juryController.resolveAppeal
);

export default router;
