import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { updatePreferencesSchema } from '@network/shared';
import { patchPreferences } from './controllers/preferences.controller.js';

const router = Router();

router.patch(
  '/preferences',
  requireAuth,
  validate({ body: updatePreferencesSchema }),
  patchPreferences
);

export default router;
