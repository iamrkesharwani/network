import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { telemetryProgressSchema } from '@network/shared';
import * as telemetryController from './telemetry.controller.js';

const router = Router();

router.post(
  '/progress',
  requireAuth,
  validate({ body: telemetryProgressSchema }),
  telemetryController.recordProgress
);

export default router;
